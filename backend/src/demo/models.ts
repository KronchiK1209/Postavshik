export type UserRole = 'supplier_user' | 'admin';

export interface Supplier {
  id: number;
  title: string;
  inn?: string;
  kpp?: string;
  email?: string;
  phone?: string;
  address?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface AppUser {
  id: number;
  supplierId?: number | null;
  username: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export type PublicUser = Omit<AppUser, 'passwordHash'>;

export interface Dock {
  id: number;
  title: string;
  location?: string;
  constraints: Record<string, unknown>;
}

export interface Timeslot {
  id: number;
  dockId: number;
  startAt: string;
  endAt: string;
  capacity: number;
}

export type BookingStatus = 'pending' | 'approved' | 'cancelled';

export interface Vehicle {
  id: number;
  numberPlate: string;
  type?: string;
  capacity?: number | null;
}

export interface Booking {
  id: number;
  supplierId: number;
  userId: number;
  vehicleId: number;
  timeslotId: number;
  status: BookingStatus;
  comment?: string;
  createdAt: string;
}

export interface BookingWithDetails extends Booking {
  supplier: Supplier;
  user: PublicUser;
  vehicle: Vehicle;
  timeslot: Timeslot;
}

export interface TimeslotSummary extends Timeslot {
  bookings: BookingWithDetails[];
  availableCapacity: number;
  isFull: boolean;
}
