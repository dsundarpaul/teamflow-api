import {
  IsEnum,
  IsNotEmpty,
  // IsNumber,
  IsOptional,
  // IsString,
} from 'class-validator';
import { Role } from '../../../generated/prisma/client';

export class FindAllUsersDto {
  @IsOptional()
  serach?: string;

  @IsNotEmpty()
  page: string;

  @IsNotEmpty()
  limit: string;

  @IsNotEmpty()
  sort: 'asc' | 'desc';

  @IsOptional()
  @IsEnum(Role)
  role: Role;

  // add more filters
}
