export type SeatStatus = 'available' | 'held' | 'booked';
export interface Seat { id: string; status: SeatStatus; heldBy?: string; holdExpiresAt?: string; bookedBy?: string; bookedAt?: string }
export interface SeatEvent { type: string; seatId?: string }
