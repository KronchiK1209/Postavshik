import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { DemoDataService } from '../demo/demo-data.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GenerateTimeslotsDto } from './dto/generate-timeslots.dto';

@Controller('admin')
@UseGuards(AuthGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly demoData: DemoDataService) {}

  @Get('bookings')
  listBookings() {
    return this.demoData.listBookings();
  }

  @Post('bookings/:id/approve')
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.demoData.updateBookingStatus(id, 'approved');
  }

  @Post('bookings/:id/cancel')
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.demoData.updateBookingStatus(id, 'cancelled');
  }

  @Post('timeslots/generate')
  generate(@Body() dto: GenerateTimeslotsDto) {
    const days = dto.days ?? 14;
    const timezone = dto.timezone ?? 'Europe/Amsterdam';
    return this.demoData.regenerateTimeslots(dto.start, days, timezone);
  }
}
