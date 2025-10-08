import { BadRequestException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import {
  AppUser,
  Booking,
  BookingStatus,
  BookingWithDetails,
  Dock,
  Supplier,
  Timeslot,
  TimeslotSummary,
  UserRole,
  Vehicle,
} from './models';
import * as argon2 from 'argon2';

dayjs.extend(utc);
dayjs.extend(timezone);

type NewSupplier = Omit<Supplier, 'id' | 'status' | 'createdAt'>;
type NewUser = Omit<AppUser, 'id' | 'createdAt' | 'isActive'> & { isActive?: boolean };
type NewVehicle = Omit<Vehicle, 'id'>;
type NewBooking = {
  supplierId: number;
  userId: number;
  timeslotId: number;
  status?: BookingStatus;
  comment?: string;
  vehicle: NewVehicle;
};

@Injectable()
export class DemoDataService implements OnModuleInit {
  private suppliers: Supplier[] = [];
  private users: AppUser[] = [];
  private docks: Dock[] = [];
  private timeslots: Timeslot[] = [];
  private bookings: Booking[] = [];
  private vehicles: Vehicle[] = [];

  private supplierSeq = 1;
  private userSeq = 1;
  private dockSeq = 1;
  private timeslotSeq = 1;
  private bookingSeq = 1;
  private vehicleSeq = 1;

  async onModuleInit() {
    await this.seed();
  }

  private async seed() {
    const tz = 'Europe/Amsterdam';
    this.docks = [
      {
        id: this.dockSeq++,
        title: 'Главный док',
        location: 'Склад №1, Амстердам',
        constraints: {
          maxHeight: '4.0 м',
          note: 'Въезд только задом',
        },
      },
      {
        id: this.dockSeq++,
        title: 'Северный док',
        location: 'Склад №2, Роттердам',
        constraints: {
          temperature: 'Холодовая цепь',
        },
      },
    ];

    this.generateTimeslots(dayjs().tz(tz).startOf('day'), 14, tz);

    const adminSupplier = this.createSupplier({
      title: 'Администрация склада',
      email: 'admin@dock.demo',
      phone: '+31 20 000 0000',
      address: 'Амстердам, Teststraat 1',
    });

    const adminPassword = await argon2.hash('AdminPortal#2025');

    this.createUser({
      supplierId: adminSupplier.id,
      username: 'admin',
      email: 'admin@dock.demo',
      passwordHash: adminPassword,
      role: 'admin',
      isActive: true,
      phone: '+31 20 000 0000',
    });
  }

  createSupplier(input: NewSupplier): Supplier {
    const supplier: Supplier = {
      id: this.supplierSeq++,
      status: 'active',
      createdAt: new Date().toISOString(),
      inn: input.inn,
      kpp: input.kpp,
      email: input.email,
      phone: input.phone,
      address: input.address,
      title: input.title,
    };
    this.suppliers.push(supplier);
    return supplier;
  }

  createUser(input: NewUser): AppUser {
    const user: AppUser = {
      id: this.userSeq++,
      supplierId: input.supplierId ?? null,
      username: input.username,
      email: input.email,
      phone: input.phone,
      passwordHash: input.passwordHash,
      role: input.role as UserRole,
      isActive: input.isActive ?? true,
      createdAt: new Date().toISOString(),
    };
    this.users.push(user);
    return user;
  }

  createVehicle(input: NewVehicle): Vehicle {
    const vehicle: Vehicle = {
      id: this.vehicleSeq++,
      ...input,
    };
    this.vehicles.push(vehicle);
    return vehicle;
  }

  createBooking(input: NewBooking): BookingWithDetails {
    const timeslot = this.findTimeslotById(input.timeslotId);
    if (!timeslot) {
      throw new NotFoundException('Слот не найден');
    }

    const activeBookings = this.bookings.filter(
      (booking) => booking.timeslotId === input.timeslotId && booking.status !== 'cancelled',
    );
    if (activeBookings.length >= timeslot.capacity) {
      throw new BadRequestException('Слот уже заполнен');
    }

    if (activeBookings.some((booking) => booking.supplierId === input.supplierId)) {
      throw new BadRequestException('Для этого слота уже создана заявка');
    }

    const vehicle = this.createVehicle(input.vehicle);

    const booking: Booking = {
      id: this.bookingSeq++,
      supplierId: input.supplierId,
      userId: input.userId,
      vehicleId: vehicle.id,
      timeslotId: input.timeslotId,
      status: input.status ?? 'pending',
      comment: input.comment,
      createdAt: new Date().toISOString(),
    };

    this.bookings.push(booking);

    return this.withBookingDetails(booking);
  }

  listSuppliers() {
    return [...this.suppliers];
  }

  listUsers() {
    return [...this.users];
  }

  listDocks() {
    return [...this.docks];
  }

  listTimeslotsByDate(date: string): TimeslotSummary[] {
    const targetDate = dayjs(date).startOf('day');
    return this.timeslots
      .filter((slot) => dayjs(slot.startAt).isSame(targetDate, 'day'))
      .map((slot) => this.toSummary(slot));
  }

  listUpcomingTimeslots(): TimeslotSummary[] {
    const now = dayjs();
    return this.timeslots
      .filter((slot) => dayjs(slot.startAt).isAfter(now.subtract(1, 'day')))
      .slice(0, 200)
      .map((slot) => this.toSummary(slot));
  }

  listBookingsForUser(userId: number): BookingWithDetails[] {
    return this.bookings
      .filter((booking) => booking.userId === userId)
      .map((booking) => this.withBookingDetails(booking));
  }

  listBookingsForSupplier(supplierId: number): BookingWithDetails[] {
    return this.bookings
      .filter((booking) => booking.supplierId === supplierId)
      .map((booking) => this.withBookingDetails(booking));
  }

  listBookings(): BookingWithDetails[] {
    return this.bookings.map((booking) => this.withBookingDetails(booking));
  }

  findUserByUsernameOrEmail(identifier: string): AppUser | undefined {
    return this.users.find(
      (user) => user.username.toLowerCase() === identifier.toLowerCase() || user.email.toLowerCase() === identifier.toLowerCase(),
    );
  }

  findUserById(id: number) {
    return this.users.find((user) => user.id === id);
  }

  findSupplierById(id: number) {
    return this.suppliers.find((supplier) => supplier.id === id);
  }

  findBookingById(id: number) {
    const booking = this.bookings.find((item) => item.id === id);
    return booking ? this.withBookingDetails(booking) : undefined;
  }

  updateUserContact(id: number, payload: Partial<Pick<AppUser, 'email' | 'phone'>>) {
    const user = this.findUserById(id);
    if (!user) {
      return undefined;
    }
    Object.assign(user, payload);
    return user;
  }

  updateSupplierContact(id: number, payload: Partial<Pick<Supplier, 'email' | 'phone' | 'address'>>) {
    const supplier = this.findSupplierById(id);
    if (!supplier) {
      return undefined;
    }
    Object.assign(supplier, payload);
    return supplier;
  }

  updateBookingStatus(id: number, status: BookingStatus) {
    const booking = this.bookings.find((item) => item.id === id);
    if (!booking) {
      throw new NotFoundException('Заявка не найдена');
    }
    booking.status = status;
    return this.withBookingDetails(booking);
  }

  cancelBooking(id: number) {
    return this.updateBookingStatus(id, 'cancelled');
  }

  regenerateTimeslots(start: string, days: number, tz = 'Europe/Amsterdam') {
    const startDate = dayjs(start).tz(tz).startOf('day');
    this.timeslots = this.timeslots.filter((slot) => dayjs(slot.startAt).isBefore(startDate));
    this.timeslotSeq = this.timeslots.length ? Math.max(...this.timeslots.map((slot) => slot.id)) + 1 : 1;
    this.generateTimeslots(startDate, days, tz);
    return this.listUpcomingTimeslots();
  }

  private withBookingDetails(booking: Booking): BookingWithDetails {
    const supplier = this.findSupplierById(booking.supplierId);
    const user = this.findUserById(booking.userId);
    const timeslot = this.findTimeslotById(booking.timeslotId);
    const vehicle = this.vehicles.find((item) => item.id === booking.vehicleId);
    if (!supplier || !user || !timeslot || !vehicle) {
      throw new Error('Broken booking references');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...publicUser } = user;
    return {
      ...booking,
      supplier,
      user: publicUser,
      timeslot,
      vehicle,
    };
  }

  private toSummary(slot: Timeslot): TimeslotSummary {
    const bookings = this.bookings
      .filter((booking) => booking.timeslotId === slot.id && booking.status !== 'cancelled')
      .map((booking) => this.withBookingDetails(booking));
    const availableCapacity = Math.max(slot.capacity - bookings.length, 0);
    return {
      ...slot,
      bookings,
      availableCapacity,
      isFull: availableCapacity <= 0,
    };
  }

  private findTimeslotById(id: number) {
    return this.timeslots.find((slot) => slot.id === id);
  }

  private generateTimeslots(startDate: dayjs.Dayjs, days: number, tz: string) {
    const workingHours = { start: 7, end: 19 };
    const slotMinutes = 30;

    for (let day = 0; day < days; day += 1) {
      const date = startDate.add(day, 'day');
      const isWeekend = date.day() === 0 || date.day() === 6;
      const capacity = isWeekend ? 1 : 2;
      for (let dock of this.docks) {
        let slotStart = date.hour(workingHours.start).minute(0).second(0).millisecond(0);
        const close = date.hour(workingHours.end).minute(0);
        while (slotStart.isBefore(close)) {
          const slotEnd = slotStart.add(slotMinutes, 'minute');
          if (!this.timeslots.some((existing) => existing.dockId === dock.id && existing.startAt === slotStart.toISOString())) {
            this.timeslots.push({
              id: this.timeslotSeq++,
              dockId: dock.id,
              startAt: slotStart.tz(tz).toISOString(),
              endAt: slotEnd.tz(tz).toISOString(),
              capacity,
            });
          }
          slotStart = slotEnd;
        }
      }
    }
  }
}
