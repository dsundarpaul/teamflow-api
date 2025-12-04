import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { FindAllTeamsDto } from './dto/find-all-teams.dto';
import { TeamRole } from '../../generated/prisma/client';

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTeamDto: CreateTeamDto, userId: string) {
    const existingTeam = await this.prisma.team.findUnique({
      where: { name: createTeamDto.name },
    });

    if (existingTeam) {
      throw new BadRequestException('Team name already exists');
    }

    const team = await this.prisma.team.create({
      data: {
        name: createTeamDto.name,
        icon: createTeamDto.icon,
        description: createTeamDto.description,
        members: {
          create: {
            userId: userId,
            role: TeamRole.ADMIN,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (createTeamDto.memberIds && createTeamDto.memberIds.length > 0) {
      for (const memberId of createTeamDto.memberIds) {
        if (memberId !== userId) {
          const user = await this.prisma.user.findUnique({
            where: { id: memberId },
          });

          if (user) {
            await this.prisma.teamMember.create({
              data: {
                teamId: team.id,
                userId: memberId,
                role: TeamRole.MEMBER,
              },
            });
          }
        }
      }
    }

    return this.findOne(team.id);
  }

  async findAll(query: FindAllTeamsDto, userId: string) {
    const { search, page = 0, limit = 10 } = query;

    const where: any = {
      members: {
        some: {
          userId: userId,
        },
      },
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const teams = await this.prisma.team.findMany({
      where,
      skip: Number(page) * Number(limit),
      take: Number(limit),
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const total = await this.prisma.team.count({ where });

    return {
      data: teams,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async findOne(id: string) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    return team;
  }

  async update(id: string, updateTeamDto: UpdateTeamDto) {
    const team = await this.prisma.team.findUnique({
      where: { id },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (updateTeamDto.name && updateTeamDto.name !== team.name) {
      const existingTeam = await this.prisma.team.findUnique({
        where: { name: updateTeamDto.name },
      });

      if (existingTeam) {
        throw new BadRequestException('Team name already exists');
      }
    }

    const updatedTeam = await this.prisma.team.update({
      where: { id },
      data: {
        name: updateTeamDto.name,
        icon: updateTeamDto.icon,
        description: updateTeamDto.description,
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return updatedTeam;
  }

  async delete(id: string) {
    const team = await this.prisma.team.findUnique({
      where: { id },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    await this.prisma.team.delete({
      where: { id },
    });

    return { message: 'Team deleted successfully' };
  }

  async addMember(teamId: string, addMemberDto: AddMemberDto) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: addMemberDto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingMember = await this.prisma.teamMember.findFirst({
      where: {
        teamId: teamId,
        userId: addMemberDto.userId,
      },
    });

    if (existingMember) {
      throw new BadRequestException('User is already a member of this team');
    }

    const teamMember = await this.prisma.teamMember.create({
      data: {
        teamId: teamId,
        userId: addMemberDto.userId,
        role: addMemberDto.role || TeamRole.MEMBER,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    return teamMember;
  }

  async removeMember(teamId: string, userId: string, requestingUserId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const memberToRemove = await this.prisma.teamMember.findFirst({
      where: {
        teamId: teamId,
        userId: userId,
      },
    });

    if (!memberToRemove) {
      throw new NotFoundException('User is not a member of this team');
    }

    if (memberToRemove.role === TeamRole.ADMIN) {
      const adminCount = await this.getAdminCount(teamId);
      if (adminCount <= 1) {
        throw new BadRequestException(
          'Cannot remove the last admin. Promote another member to admin first.',
        );
      }
    }

    await this.prisma.teamMember.delete({
      where: { id: memberToRemove.id },
    });

    return { message: 'Member removed successfully' };
  }

  async updateMemberRole(
    teamId: string,
    userId: string,
    updateMemberRoleDto: UpdateMemberRoleDto,
  ) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const member = await this.prisma.teamMember.findFirst({
      where: {
        teamId: teamId,
        userId: userId,
      },
    });

    if (!member) {
      throw new NotFoundException('User is not a member of this team');
    }

    if (
      member.role === TeamRole.ADMIN &&
      updateMemberRoleDto.role === TeamRole.MEMBER
    ) {
      const adminCount = await this.getAdminCount(teamId);
      if (adminCount <= 1) {
        throw new BadRequestException(
          'Cannot demote the last admin. Promote another member to admin first.',
        );
      }
    }

    const updatedMember = await this.prisma.teamMember.update({
      where: { id: member.id },
      data: {
        role: updateMemberRoleDto.role,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    return updatedMember;
  }

  async leave(teamId: string, userId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const member = await this.prisma.teamMember.findFirst({
      where: {
        teamId: teamId,
        userId: userId,
      },
    });

    if (!member) {
      throw new NotFoundException('You are not a member of this team');
    }

    if (member.role === TeamRole.ADMIN) {
      const adminCount = await this.getAdminCount(teamId);
      if (adminCount <= 1) {
        throw new BadRequestException(
          'Cannot leave as the last admin. Promote another member to admin or delete the team.',
        );
      }
    }

    await this.prisma.teamMember.delete({
      where: { id: member.id },
    });

    return { message: 'Successfully left the team' };
  }

  async isTeamAdmin(teamId: string, userId: string): Promise<boolean> {
    const member = await this.prisma.teamMember.findFirst({
      where: {
        teamId: teamId,
        userId: userId,
        role: TeamRole.ADMIN,
      },
    });

    return !!member;
  }

  async isTeamMember(teamId: string, userId: string): Promise<boolean> {
    const member = await this.prisma.teamMember.findFirst({
      where: {
        teamId: teamId,
        userId: userId,
      },
    });

    return !!member;
  }

  private async getAdminCount(teamId: string): Promise<number> {
    return await this.prisma.teamMember.count({
      where: {
        teamId: teamId,
        role: TeamRole.ADMIN,
      },
    });
  }
}

