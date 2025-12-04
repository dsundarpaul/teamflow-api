import { Module } from '@nestjs/common';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import { PrismaService } from 'src/prisma.service';
import { TeamAdminGuard } from './guards/team-admin.guard';
import { TeamMemberGuard } from './guards/team-member.guard';

@Module({
  imports: [],
  controllers: [TeamsController],
  providers: [TeamsService, PrismaService, TeamAdminGuard, TeamMemberGuard],
  exports: [TeamsService],
})
export class TeamsModule {}

