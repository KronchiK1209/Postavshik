import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsEmail } from 'class-validator';

const trim = () =>
  Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

export class UpdateProfileDto {
  @trim()
  @IsOptional()
  @IsEmail()
  email?: string;

  @trim()
  @IsOptional()
  @IsString()
  phone?: string;

  @trim()
  @IsOptional()
  @IsString()
  address?: string;
}
