import { Controller, Get, UseGuards } from '@nestjs/common';
import { DemoDataService } from '../demo/demo-data.service';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('docks')
@UseGuards(AuthGuard)
export class DocksController {
  constructor(private readonly demoData: DemoDataService) {}

  @Get()
  list() {
    return this.demoData.listDocks();
  }
}
