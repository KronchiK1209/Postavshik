import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { DemoModule } from './demo/demo.module';
import { ProfileController } from './profile/profile.controller';
import { DocksController } from './docks/docks.controller';
import { TimeslotsController } from './timeslots/timeslots.controller';
import { BookingsController } from './bookings/bookings.controller';
import { AdminController } from './admin/admin.controller';
import { RolesGuard } from './common/guards/roles.guard';
import { AuthGuard } from './common/guards/auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DemoModule,
    AuthModule,
  ],
  controllers: [ProfileController, DocksController, TimeslotsController, BookingsController, AdminController],
  providers: [
    AuthGuard,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
