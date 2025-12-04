import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { TeamRole } from '../../../generated/prisma/client';

@Injectable()
export class TeamAdminGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const teamId = request.params.id || request.params.teamId;

    if (!user || !user.sub) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!teamId) {
      throw new ForbiddenException('Team ID not provided');
    }

    const teamMember = await this.prisma.teamMember.findFirst({
      where: {
        teamId,
        userId: user.sub,
      },
    });

    if (!teamMember) {
      throw new NotFoundException('Team not found or user is not a member');
    }

    if (teamMember.role !== TeamRole.ADMIN) {
      throw new ForbiddenException('Only team admins can perform this action');
    }

    request.teamMember = teamMember;
    return true;
  }
}

