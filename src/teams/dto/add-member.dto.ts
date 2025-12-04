import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { TeamRole } from '../../../generated/prisma/client';

export class AddMemberDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEnum(TeamRole)
  @IsOptional()
  role?: TeamRole;
}

