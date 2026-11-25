import type { Seat } from './types';
const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
export async function getSeats(): Promise<Seat[]> {
  const r = await fetch(`${base}/api/seats`); if (!r.ok) throw new Error('Could not load seats. Check your connection and try again.'); return (await r.json()).seats;
}
export async function seatAction(id: string, action: 'hold'|'confirm', userId: string): Promise<void> {
  let r: Response;
  try { r = await fetch(`${base}/api/seats/${encodeURIComponent(id)}/${action}`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({userId}) }); }
  catch { throw new Error('Network error. Check your connection and try again.'); }
  if (!r.ok) { let message = 'Something went wrong. Please try again.'; try { message = (await r.json()).error?.message || message; } catch {} throw new Error(message); }
}
export function socketUrl() { const url = new URL(base || window.location.origin); url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'; url.pathname = '/ws'; return url.toString(); }
