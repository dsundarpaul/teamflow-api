import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TeamMemberGuard implements CanActivate {
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
      include: {
        team: true,
      },
    });

    if (!teamMember) {
      throw new NotFoundException('Team not found or user is not a member');
    }

    request.teamMember = teamMember;
    request.team = teamMember.team;
    return true;
  }
}

