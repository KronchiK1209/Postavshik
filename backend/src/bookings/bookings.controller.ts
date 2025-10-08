import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { DemoDataService } from '../demo/demo-data.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AppUser } from '../demo/models';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller('bookings')
@UseGuards(AuthGuard)
export class BookingsController {
  constructor(private readonly demoData: DemoDataService) {}

  @Get('my')
  listMy(@CurrentUser() user: AppUser) {
    if (user.role === 'admin') {
      return this.demoData.listBookings();
    }
    if (user.supplierId) {
      return this.demoData.listBookingsForSupplier(user.supplierId);
    }
    return [];
  }

  @Post()
  create(@CurrentUser() user: AppUser, @Body() dto: CreateBookingDto) {
    if (!user.supplierId) {
      throw new ForbiddenException('Только поставщики могут создавать бронь');
    }

    return this.demoData.createBooking({
      supplierId: user.supplierId,
      userId: user.id,
      timeslotId: dto.timeslotId,
      comment: dto.comment,
      vehicle: {
        numberPlate: dto.vehicle.numberPlate,
        type: dto.vehicle.type,
        capacity: dto.vehicle.capacity ?? null,
      },
    });
  }

  @Delete(':id')
  cancel(@CurrentUser() user: AppUser, @Param('id', ParseIntPipe) id: number) {
    const booking = this.demoData.findBookingById(id);
    if (!booking) {
      return {};
    }

    if (user.role !== 'admin' && booking.userId !== user.id) {
      throw new ForbiddenException('Можно отменить только свою заявку');
    }

    return this.demoData.cancelBooking(id);
  }
}
