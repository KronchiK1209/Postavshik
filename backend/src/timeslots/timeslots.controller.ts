import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DemoDataService } from '../demo/demo-data.service';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('timeslots')
@UseGuards(AuthGuard)
export class TimeslotsController {
  constructor(private readonly demoData: DemoDataService) {}

  @Get()
  listByDate(@Query('date') date?: string) {
    if (!date) {
      return this.demoData.listUpcomingTimeslots();
    }
    return this.demoData.listTimeslotsByDate(date);
  }
}
