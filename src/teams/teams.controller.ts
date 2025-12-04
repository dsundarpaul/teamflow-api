import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { FindAllTeamsDto } from './dto/find-all-teams.dto';
import { CurrentUser } from 'src/auth/decorators';
import { TeamAdminGuard } from './guards/team-admin.guard';
import { TeamMemberGuard } from './guards/team-member.guard';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  async create(
    @Body() createTeamDto: CreateTeamDto,
    @CurrentUser() user: any,
  ) {
    return this.teamsService.create(createTeamDto, user.sub);
  }

  @Get()
  async findAll(@Query() query: FindAllTeamsDto, @CurrentUser() user: any) {
    return this.teamsService.findAll(query, user.sub);
  }

  @Get(':id')
  @UseGuards(TeamMemberGuard)
  async findOne(@Param('id') id: string) {
    return this.teamsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(TeamAdminGuard)
  async update(@Param('id') id: string, @Body() updateTeamDto: UpdateTeamDto) {
    return this.teamsService.update(id, updateTeamDto);
  }

  @Delete(':id')
  @UseGuards(TeamAdminGuard)
  async delete(@Param('id') id: string) {
    return this.teamsService.delete(id);
  }

  @Post(':id/members')
  @UseGuards(TeamAdminGuard)
  async addMember(
    @Param('id') id: string,
    @Body() addMemberDto: AddMemberDto,
  ) {
    return this.teamsService.addMember(id, addMemberDto);
  }

  @Delete(':id/members/:userId')
  @UseGuards(TeamAdminGuard)
  async removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @CurrentUser() user: any,
  ) {
    return this.teamsService.removeMember(id, userId, user.sub);
  }

  @Patch(':id/members/:userId/role')
  @UseGuards(TeamAdminGuard)
  async updateMemberRole(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() updateMemberRoleDto: UpdateMemberRoleDto,
  ) {
    return this.teamsService.updateMemberRole(id, userId, updateMemberRoleDto);
  }

  @Post(':id/leave')
  @UseGuards(TeamMemberGuard)
  async leave(@Param('id') id: string, @CurrentUser() user: any) {
    return this.teamsService.leave(id, user.sub);
  }
}

