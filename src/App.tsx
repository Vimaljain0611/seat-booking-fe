import { useCallback, useEffect, useMemo, useState } from 'react';
import { getSeats, seatAction, socketUrl } from './api';
import type { Seat } from './types';

export default function App() {
  const [seats, setSeats] = useState<Seat[]>([]), [userId, setUserId] = useState<string>(() => `user-${crypto.randomUUID().slice(0, 8)}`), [status, setStatus] = useState<'connected'|'reconnecting'>('reconnecting'), [error, setError] = useState(''), [now, setNow] = useState(Date.now());
  const refresh = useCallback(async () => { try { setSeats(await getSeats()); } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load seats.'); } }, []);
  useEffect(() => { void refresh(); const timer = window.setInterval(() => setNow(Date.now()), 250); return () => clearInterval(timer); }, [refresh]);
  useEffect(() => {
    let socket: WebSocket, retry = 500, stopped = false, timer: number;
    const connect = () => { if (stopped) return; socket = new WebSocket(socketUrl()); socket.onopen = () => { retry = 500; setStatus('connected'); void refresh(); }; socket.onmessage = () => void refresh(); socket.onclose = socket.onerror = () => { setStatus('reconnecting'); if (!stopped) { timer = window.setTimeout(connect, retry); retry = Math.min(retry * 2, 10000); } }; };
    connect(); return () => { stopped = true; clearTimeout(timer); socket?.close(); };
  }, [refresh]);
  const mySeat = useMemo(() => seats.find(s => s.status === 'held' && s.heldBy === userId), [seats, userId]);
  const act = async (seat: Seat, action: 'hold'|'confirm') => { setError(''); if (!userId.trim()) { setError('Enter a user ID first.'); return; } try { await seatAction(seat.id, action, userId.trim()); await refresh(); } catch (e) { setError(e instanceof Error ? e.message : 'Request failed.'); await refresh(); } };
  const remaining = mySeat?.holdExpiresAt ? Math.max(0, Math.ceil((new Date(mySeat.holdExpiresAt).getTime() - now) / 1000)) : 0;
  return <main className="page"><header><div className="eyebrow">LIVE EVENT · SEATING</div><h1>Choose your seat<span>.</span></h1><p className="sub">A place in the room is waiting for you.</p></header>
    <section className="toolbar"><label htmlFor="user">Your booking ID</label><input id="user" value={userId} maxLength={80} onChange={e => setUserId(e.target.value)} aria-label="Your booking ID"/><span className={`connection ${status}`}><i/> {status === 'connected' ? 'Live' : 'Reconnecting'}</span></section>
    {error && <div className="error" role="alert">{error}<button onClick={() => setError('')} aria-label="Dismiss message">×</button></div>}
    <section className="layout"><div className="venue"><div className="stage">STAGE</div><div className="grid" aria-label="Seat selection">{['A','B','C','D'].map(row => <div className="row" key={row}><span className="row-label">{row}</span>{[1,2,3,4,5].map(n => { const id = `${row}${n}`, seat = seats.find(s => s.id === id) || {id,status:'available' as const}; const mine = seat.status === 'held' && seat.heldBy === userId; const label = seat.status === 'booked' ? 'Booked' : seat.status === 'held' ? mine ? 'Held by you' : 'Held by another user' : 'Available'; return <button key={id} disabled={seat.status === 'booked' || (seat.status === 'held' && !mine)} onClick={() => void act(seat, mine ? 'confirm' : 'hold')} className={`seat ${seat.status} ${mine?'mine':''}`} aria-label={`Seat ${id}, ${label}${mine ? `, ${remaining} seconds remaining` : ''}`} title={`${id} · ${label}`}>{id}</button>; })}</div>)}</div><div className="legend"><span><i className="available"/>Available</span><span><i className="mine"/>Your hold</span><span><i className="other"/>Held</span><span><i className="booked"/>Booked</span></div></div>
      <aside className="card"><div className="eyebrow">YOUR SELECTION</div>{mySeat ? <><h2>Seat {mySeat.id}</h2><p className="desc">We’re holding this seat for you.</p><div className="countdown"><strong>{String(Math.floor(remaining/60)).padStart(2,'0')}:{String(remaining%60).padStart(2,'0')}</strong><span>TIME REMAINING</span></div><button className="confirm" onClick={() => void act(mySeat,'confirm')} disabled={remaining===0}>Confirm booking <span>→</span></button></> : <><h2>Find your place</h2><p className="desc">Select any available seat to hold it for 60 seconds. Then confirm your booking.</p><div className="hint">↖ &nbsp;Choose a seat from the seating plan</div></>}<div className="card-foot">One event · 20 seats</div></aside></section><footer>Seat availability updates live across all open sessions.</footer>
  </main>;
}
