import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class FindAllTeamsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;
}

