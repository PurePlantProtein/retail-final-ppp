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
	resetPasswordForEmail?: (email: string) => Promise<any>;
};

const apiBase = import.meta.env.VITE_API_BASE || '/api';

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
		if (data.token) setToken(data.token);
		return { data };
	},
	async signInWithPassword({ email, password }) {
		const res = await fetch(`${apiBase}/auth/signin`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
		const data = await res.json();
		if (data.token) setToken(data.token);
		return { data };
	},
	async signOut() {
		setToken(null);
		// notify listeners by calling onAuthStateChange later via getSession
		return { data: null };
	},
	async getUser() {
		const token = getToken();
		if (!token) return { data: { user: null } };
		try {
			const payload = JSON.parse(atob(token.split('.')[1]));
			return { data: { user: { id: payload.sub, email: payload.email } } };
		} catch (e) {
			return { data: { user: null } };
		}
	},
	onAuthStateChange(fn: any) {
		let unsubbed = false;
		const subscription = { unsubscribe: () => { unsubbed = true; } };
		setTimeout(async () => {
			if (unsubbed) return;
			const { data } = await auth.getSession();
			fn(data.session ? 'SIGNED_IN' : 'SIGNED_OUT', data.session);
		}, 0);
		return { data: { subscription } };
	},
	async updateUser(obj: any) {
		const res = await fetch(`${apiBase}/auth/update`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(obj) });
		const data = await res.json();
		return { data };
	},
	async getSession() {
		const res = await fetch(`${apiBase}/auth/session`, { headers: { ...authHeaders() } });
		const body = await res.json();
		return { data: body };
	},
	async resetPasswordForEmail(email: string) {
		const res = await fetch(`${apiBase}/auth/reset-request`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
		const data = await res.json();
		return { data };
	}
};

function buildQueryBuilder(table: string) {
	const state: any = { table, select: '*', filters: [], maybeSingle: false };
	const execute = async () => {
		const res = await fetch(`${apiBase}/query`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(state) });
		const body = await res.json();
		return { data: body.data, error: body.error };
	};

	const builder: any = {
		select(sel = '*') { state.select = sel; return builder; },
		eq(field: string, value: any) { state.filters.push({ type: 'eq', field, value }); return builder; },
		maybeSingle() { state.maybeSingle = true; return builder; },
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
				const res = await fetch(`${apiBase}/storage/${bucket}/upload`, { method: 'POST', headers: { ...authHeaders() }, body: fd });
				return { data: await res.json() };
			},
			getPublicUrl: (p: string) => ({ data: { publicUrl: `${apiBase}/storage/${bucket}/${p}` } })
		})
	}
};
