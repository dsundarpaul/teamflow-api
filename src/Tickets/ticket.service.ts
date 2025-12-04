import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TeamRole } from '../prisma.service';

@Injectable()
export class TicketService {
  constructor(private prisma: PrismaService) {}

  async createTicket(userId: string, dto: CreateTicketDto) {
    const teamUser = await this.prisma.teamUser.findUnique({
      where: { teamId_userId: { teamId: dto.teamId, userId } },
    });

    if (!teamUser) {
      throw new ForbiddenException('You are not part of this team');
    }

    const ticket = await this.prisma.ticket.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status || 'OPEN',
        authorId: userId,
        teamId: dto.teamId,
      },
    });

    return ticket;
  }

  // Get tickets with optional filters
  async getTickets(userId: string, teamId?: string) {
    const query: any = {};

    // Get user teams
    const teams = await this.prisma.teamUser.findMany({
      where: { userId },
      select: { teamId: true },
    });
    const allowedTeams = teams.map((t) => t.teamId);

    if (teamId && !allowedTeams.includes(teamId)) {
      throw new ForbiddenException('Cannot access tickets of this team');
    }

    query.teamId = teamId ? teamId : { in: allowedTeams };

    return this.prisma.ticket.findMany({ where: query });
  }

  // Update ticket
  // async updateTicket(userId: string, ticketId: string, dto: UpdateTicketDto) {
  //   const ticket = await this.prisma.ticket.findUnique({
  //     where: { id: ticketId },
  //   });

  //   if (!ticket) throw new ForbiddenException('Ticket not found');

  //   // check if user is part of ticket's team
  //   const teamUser = await this.prisma.teamUser.findUnique({
  //     where: { teamId_userId: { teamId: ticket.teamId, userId } },
  //   });

  //   if (!teamUser) throw new ForbiddenException('Not allowed');

  //   return this.prisma.ticket.update({
  //     where: { id: ticketId },
  //     data: dto,
  //   });
  }

  // Delete ticket
  // async deleteTicket(userId: string, ticketId: string) {
  //   const ticket = await this.prisma.ticket.findUnique({
  //     where: { id: ticketId },
  //   });

  //   if (!ticket) throw new ForbiddenException('Ticket not found');

  //   const teamUser = await this.prisma.teamUser.findUnique({
  //     where: { teamId_userId: { teamId: ticket.teamId, userId } },
  //   });

  //   if (!teamUser || teamUser.role !== TeamRole.ADMIN) {
  //     throw new ForbiddenException('Only team admin can delete tickets');
  //   }

  //   return this.prisma.ticket.delete({ where: { id: ticketId } });
  // }
}
