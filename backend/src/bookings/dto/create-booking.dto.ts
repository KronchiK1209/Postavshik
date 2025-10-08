import { Transform, Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

const trim = () =>
  Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

class VehicleDto {
  @trim()
  @IsString()
  @IsNotEmpty()
  numberPlate!: string;

  @trim()
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  capacity?: number;
}

export class CreateBookingDto {
  @IsInt()
  timeslotId!: number;

  @trim()
  @IsOptional()
  @IsString()
  comment?: string;

  @ValidateNested()
  @Type(() => VehicleDto)
  vehicle!: VehicleDto;
}
