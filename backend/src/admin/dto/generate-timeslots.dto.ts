import { Transform } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';

export class GenerateTimeslotsDto {
  @IsDateString()
  start!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  days?: number = 14;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value : 'Europe/Amsterdam'))
  timezone?: string = 'Europe/Amsterdam';
}
