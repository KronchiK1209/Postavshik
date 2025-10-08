import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { DemoDataService } from '../demo/demo-data.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AppUser, Supplier } from '../demo/models';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller()
@UseGuards(AuthGuard)
export class ProfileController {
  constructor(private readonly demoData: DemoDataService) {}

  @Get('me')
  getProfile(@CurrentUser() user: AppUser) {
    const supplier = user.supplierId ? this.demoData.findSupplierById(user.supplierId) ?? null : null;
    const { passwordHash, ...safeUser } = user;
    return {
      user: safeUser,
      supplier,
    };
  }

  @Put('me')
  updateProfile(@CurrentUser() user: AppUser, @Body() dto: UpdateProfileDto) {
    const updatedUser = this.demoData.updateUserContact(user.id, {
      email: dto.email ?? user.email,
      phone: dto.phone ?? user.phone,
    });

    let updatedSupplier: Supplier | undefined | null = null;
    if (user.supplierId) {
      updatedSupplier = this.demoData.updateSupplierContact(user.supplierId, {
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
      });
    }

    const safeUser = updatedUser
      ? (({ passwordHash, ...rest }) => rest)(updatedUser)
      : (({ passwordHash, ...rest }) => rest)(user);

    return {
      user: safeUser,
      supplier: updatedSupplier ?? null,
    };
  }
}
