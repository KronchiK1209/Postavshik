export type UserRole = 'supplier_user' | 'admin';

export interface SupplierDto {
  id: number;
  title: string;
  inn?: string | null;
  kpp?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  status?: string;
  createdAt?: string;
}

export interface PortalUser {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  supplierId?: number | null;
  phone?: string | null;
  isActive?: boolean;
  createdAt?: string;
}

export interface TimeslotDto {
  id: number;
  dockId: number;
  startAt: string;
  endAt: string;
  capacity: number;
}

export interface VehicleDto {
  id: number;
  numberPlate: string;
  type?: string | null;
  capacity?: number | null;
}

export interface BookingDto {
  id: number;
  supplierId: number;
  userId: number;
  vehicleId: number;
  timeslotId: number;
  status: 'pending' | 'approved' | 'cancelled';
  comment?: string | null;
  createdAt: string;
  supplier: SupplierDto;
  user: PortalUser;
  vehicle: VehicleDto;
  timeslot: TimeslotDto;
}

export interface TimeslotSummaryDto extends TimeslotDto {
  bookings: BookingDto[];
  availableCapacity: number;
  isFull: boolean;
}

export interface AuthSessionDto {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  supplier?: SupplierDto | null;
}

export interface ProfileResponseDto {
  user: PortalUser;
  supplier: SupplierDto | null;
}
