import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { DemoDataService } from '../demo/demo-data.service';
import { AppUser, Supplier } from '../demo/models';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

export interface AuthPayload {
  id: number;
  username: string;
  email: string;
  role: string;
  supplier?: Supplier | null;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly demoData: DemoDataService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthPayload> {
    const existing = this.demoData.findUserByUsernameOrEmail(dto.username) ??
      this.demoData.findUserByUsernameOrEmail(dto.accountEmail);
    if (existing) {
      throw new ConflictException('Пользователь с таким логином или email уже существует');
    }

    const supplier = this.demoData.createSupplier({
      title: dto.supplierTitle,
      inn: dto.inn,
      kpp: dto.kpp,
      email: dto.email,
      phone: dto.phone,
      address: dto.address,
    });

    const passwordHash = await argon2.hash(dto.password);

    const user = this.demoData.createUser({
      supplierId: supplier.id,
      username: dto.username,
      email: dto.accountEmail,
      phone: dto.accountPhone,
      passwordHash,
      role: 'supplier_user',
      isActive: true,
    });

    return this.toPayload(user, supplier);
  }

  async validateCredentials(identifier: string, password: string): Promise<AppUser> {
    const user = this.demoData.findUserByUsernameOrEmail(identifier);
    if (!user) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    const isValid = await argon2.verify(user.passwordHash, password);
    if (!isValid) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    return user;
  }

  async login(dto: LoginDto): Promise<AuthPayload> {
    const user = await this.validateCredentials(dto.identifier, dto.password);
    const supplier = user.supplierId ? this.demoData.findSupplierById(user.supplierId) ?? null : null;
    return this.toPayload(user, supplier ?? null);
  }

  issueToken(payload: AuthPayload) {
    return this.jwt.sign({ sub: payload.id, role: payload.role });
  }

  toPayload(user: AppUser, supplier: Supplier | null = null): AuthPayload {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      supplier,
    };
  }
}
