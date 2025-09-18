import { supabase } from '@/integrations/supabase/client';

const apiBase = (import.meta as any).env?.VITE_PUBLIC_API_URL || (import.meta as any).env?.VITE_API_BASE || '/api';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export type SiteAsset = {
  name: string;
  size: number;
  mtime: string | Date;
  url: string;
};

export async function listAssets(): Promise<SiteAsset[]> {
  const res = await fetch(`${apiBase}/storage/assets`, { headers: { ...authHeaders() } });
  const body = await res.json();
  if (!res.ok || body.error) throw new Error(body.error || 'failed to list assets');
  return (body.data || []).map((a: any) => ({ ...a, mtime: a.mtime }));
}

export async function uploadAsset(file: File, key?: string): Promise<{ name: string; url: string; key: string | null }>
{
  const fd = new FormData();
  fd.append('file', file);
  if (key) fd.append('path', key); // align with backend expecting 'path'
  const res = await fetch(`${apiBase}/storage/assets/upload`, { method: 'POST', headers: { ...authHeaders() }, body: fd });
  const body = await res.json();
  if (!res.ok || body.error) throw new Error(body.error || 'upload failed');
  return { name: body.name, url: body.url, key: body.key };
}

export async function deleteAsset(nameOrKey: string): Promise<void> {
  const res = await fetch(`${apiBase}/storage/assets/${encodeURIComponent(nameOrKey)}`, { method: 'DELETE', headers: { ...authHeaders() } });
  const body = await res.json();
  if (!res.ok || body.error) throw new Error(body.error || 'delete failed');
}

export function getAssetUrl(nameOrKey: string): string {
  return `${apiBase}/storage/assets/${encodeURIComponent(nameOrKey)}`;
}
