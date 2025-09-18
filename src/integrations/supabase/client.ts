// Lightweight shim to make frontend's supabase calls work with the local API.
// This file intentionally implements a minimal, compatible surface used by the app.

type SupabaseAuth = {
	signUp: (opts: { email: string; password: string }) => Promise<any>;
	signInWithPassword: (opts: { email: string; password: string }) => Promise<any>;
	signOut: () => Promise<any>;
	getUser: () => Promise<any>;
	onAuthStateChange: (fn: any) => { data: { subscription: { unsubscribe: () => void } } };
	updateUser: (obj: any) => Promise<any>;
	getSession: () => Promise<any>;
	resetPasswordForEmail?: (email: string, options?: any) => Promise<any>;
};

// Prefer the same env used by the app (VITE_PUBLIC_API_URL), then fallback to legacy VITE_API_BASE, then '/api'
const apiBase = (import.meta as any).env?.VITE_PUBLIC_API_URL || (import.meta as any).env?.VITE_API_BASE || '/api';

function setToken(token: string | null) {
	if (token) localStorage.setItem('token', token);
	else localStorage.removeItem('token');
}

function getToken() {
	return localStorage.getItem('token');
}

function authHeaders() {
	const token = getToken();
	return token ? { Authorization: `Bearer ${token}` } : {};
}

const auth: SupabaseAuth = {
	async signUp({ email, password }) {
		const res = await fetch(`${apiBase}/auth/signup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
		const data = await res.json();
		if (!res.ok) {
			throw new Error((data && (data.error || data.message)) || 'Sign up failed');
		}
		if (data.token) setToken(data.token);
		// Notify listeners of auth change
		try {
			const { data: { session } } = await auth.getSession();
			emitAuthChange(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);
		} catch {}
		return { data };
	},
	async signInWithPassword({ email, password }) {
		const res = await fetch(`${apiBase}/auth/signin`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
		const data = await res.json();
		if (!res.ok) {
			throw new Error((data && (data.error || data.message)) || 'Invalid credentials');
		}
		if (data.token) setToken(data.token);
		// Notify listeners of auth change
		try {
			const { data: { session } } = await auth.getSession();
			emitAuthChange(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);
		} catch {}
		return { data };
	},
	async signOut() {
		setToken(null);
		// Notify listeners immediately
		emitAuthChange('SIGNED_OUT', null);
		return { data: null };
	},
	async getUser() {
		const { data: { session } } = await auth.getSession();
		return { data: { user: session?.user ?? null }, error: null as any };
	},
	onAuthStateChange(fn: any) {
		const subscription = addAuthListener(fn);
		// Fire current state immediately
		(async () => {
			try {
				const { data: { session } } = await auth.getSession();
				fn(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);
			} catch {
				fn('SIGNED_OUT', null);
			}
		})();
		return { data: { subscription } } as any;
	},
	async updateUser(obj: any) {
		const res = await fetch(`${apiBase}/auth/update`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(obj) });
		const data = await res.json();
		return { data };
	},
	async getSession() {
		const res = await fetch(`${apiBase}/auth/session`, { headers: { ...authHeaders() } });
		const body = await res.json();
		const session = body?.data?.session ?? null;
		return { data: { session }, error: null as any };
	},
	async resetPasswordForEmail(email: string, _options?: any) {
		// _options (e.g., redirectTo) are ignored on the server; the server email constructs the link from origin.
		const res = await fetch(`${apiBase}/auth/reset-request`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
		const data = await res.json();
		return { data };
	}
};

// --- Simple auth listener system to mimic Supabase ---
type AuthChangeHandler = (event: 'SIGNED_IN' | 'SIGNED_OUT', session: any) => void;
const listeners: AuthChangeHandler[] = [];
function addAuthListener(fn: AuthChangeHandler) {
	listeners.push(fn);
	return {
		unsubscribe: () => {
			const idx = listeners.indexOf(fn);
			if (idx >= 0) listeners.splice(idx, 1);
		}
	};
}
function emitAuthChange(event: 'SIGNED_IN' | 'SIGNED_OUT', session: any) {
	for (const fn of [...listeners]) {
		try { fn(event, session); } catch {}
	}
}

function buildQueryBuilder(table: string) {
	const state: any = {
		table,
		select: '*',
		filters: [],
		maybeSingle: false,
		action: undefined as undefined | 'insert' | 'update' | 'delete' | 'upsert',
		values: undefined as any,
		order: [] as Array<{ column: string; ascending?: boolean }>,
		onConflict: undefined as string | undefined,
	};

	const execute = async () => {
		// For update/delete, map first eq filter to 'where'
		let payload: any = { ...state };
		if ((state.action === 'update' || state.action === 'delete') && state.filters.length) {
			const firstEq = state.filters.find((f: any) => f.type === 'eq');
			if (firstEq) payload.where = { field: firstEq.field, value: firstEq.value };
		}
			// Debug: log outgoing query payload for troubleshooting updates
			try {
				// avoid blowing up when circular refs exist
				console.debug('[supabase-shim] outgoing /query payload', { table: payload.table, action: payload.action, where: payload.where, valuesKeys: payload.values ? Object.keys(payload.values) : undefined });
			} catch (e) {}

			// Handle client-side upsert: select -> update or insert
			if (state.action === 'upsert') {
				const rows: any[] = Array.isArray(state.values) ? state.values : [state.values];
				const results: any[] = [];
				for (const row of rows) {
					const conflictKey = state.onConflict;
					if (!conflictKey) throw new Error('upsert requires onConflict key');
					const conflictVal = row[conflictKey];
					// 1) check if exists
					const checkRes = await fetch(`${apiBase}/query`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json', ...authHeaders() },
						body: JSON.stringify({ table: state.table, select: '*', filters: [{ type: 'eq', field: conflictKey, value: conflictVal }], maybeSingle: true })
					});
					const checkBody = await checkRes.json();
					const exists = !!checkBody?.data;
					if (exists) {
						const updRes = await fetch(`${apiBase}/query`, {
							method: 'POST',
							headers: { 'Content-Type': 'application/json', ...authHeaders() },
							body: JSON.stringify({ table: state.table, action: 'update', values: row, where: { field: conflictKey, value: conflictVal }, maybeSingle: true })
						});
						const updBody = await updRes.json();
						if (updBody.error) console.debug('[supabase-shim] upsert(update) error', updBody.error);
						results.push(updBody.data);
					} else {
						const insRes = await fetch(`${apiBase}/query`, {
							method: 'POST',
							headers: { 'Content-Type': 'application/json', ...authHeaders() },
							body: JSON.stringify({ table: state.table, action: 'insert', values: row, maybeSingle: true })
						});
						const insBody = await insRes.json();
						if (insBody.error) console.debug('[supabase-shim] upsert(insert) error', insBody.error);
						results.push(insBody.data);
					}
				}
				return { data: state.maybeSingle ? (results[0] ?? null) : results, error: null as any };
			}

			const res = await fetch(`${apiBase}/query`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', ...authHeaders() },
			body: JSON.stringify(payload),
		});
		if (res.status === 401) {
			setToken(null);
			try { emitAuthChange('SIGNED_OUT', null); } catch {}
			return { data: state.maybeSingle ? null : [], error: 'unauthorized' };
		}
		const body = await res.json();
			// Debug: log any error returned by API
			if (body && body.error) console.debug('[supabase-shim] /query response error', body.error);
		return { data: body.data, error: body.error };
	};

	const builder: any = {
		select(sel = '*') { state.select = sel; return builder; },
		eq(field: string, value: any) { state.filters.push({ type: 'eq', field, value }); return builder; },
		order(column: string, opts?: { ascending?: boolean }) { state.order.push({ column, ascending: opts?.ascending }); return builder; },
		ilike(field: string, value: string) { state.filters.push({ type: 'ilike', field, value }); return builder; },
		in(field: string, values: any[]) { state.filters.push({ type: 'in', field, value: values }); return builder; },
		maybeSingle() { state.maybeSingle = true; return builder; },
	single() { state.maybeSingle = true; return builder; },
		insert(rows: any[]) {
			state.action = 'insert';
			// Preserve arrays for batch inserts; pass object through as-is
			state.values = rows;
			return builder;
		},
		upsert(rows: any[] | any, opts?: { onConflict?: string }) {
			state.action = 'upsert';
			state.values = rows;
			state.onConflict = opts?.onConflict;
			return builder;
		},
		update(values: any) { state.action = 'update'; state.values = values; return builder; },
		delete() { state.action = 'delete'; return builder; },
	async then(resolve: any, reject: any) { try { const r = await execute(); resolve(r); } catch (e) { reject(e); } }
	};
	return builder;
}

export const supabase: any = {
	auth,
	from: (table: string) => buildQueryBuilder(table),
	functions: {
		invoke: async (fnName: string, opts: any) => {
			const res = await fetch(`${apiBase}/functions/${fnName}`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(opts) });
			return { data: await res.json() };
		}
	},
	storage: {
		from: (bucket: string) => ({
			async upload(path: string, file: any) {
					const fd = new FormData();
					fd.append('file', file);
					fd.append('path', path);
				const res = await fetch(`${apiBase}/storage/${bucket}/upload`, { method: 'POST', headers: { ...authHeaders() }, body: fd });
				return { data: await res.json() };
			},
			getPublicUrl: (p: string) => ({ data: { publicUrl: `${apiBase}/storage/${bucket}/${p}` } })
		})
	}
};
