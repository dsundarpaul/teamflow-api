import { IsEnum, IsNotEmpty } from 'class-validator';
import { TeamRole } from '../../../generated/prisma/client';

export class UpdateMemberRoleDto {
  @IsEnum(TeamRole)
  @IsNotEmpty()
  role: TeamRole;
}

