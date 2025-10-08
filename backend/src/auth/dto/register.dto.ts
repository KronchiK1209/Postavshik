import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

const trim = () =>
  Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

export class RegisterDto {
  @trim()
  @IsNotEmpty()
  @IsString()
  supplierTitle!: string;

  @trim()
  @IsOptional()
  @IsString()
  inn?: string;

  @trim()
  @IsOptional()
  @IsString()
  kpp?: string;

  @trim()
  @IsOptional()
  @IsString()
  address?: string;

  @trim()
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @trim()
  @IsOptional()
  @IsString()
  phone?: string;

  @trim()
  @IsNotEmpty()
  @IsString()
  username!: string;

  @trim()
  @IsNotEmpty()
  @IsEmail()
  accountEmail!: string;

  @trim()
  @IsOptional()
  @IsString()
  accountPhone?: string;

  @trim()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/, {
    message: 'Пароль должен содержать строчные/прописные буквы, цифры и спецсимволы',
  })
  password!: string;

  @IsOptional()
  @IsBoolean()
  acceptTerms?: boolean;
}
