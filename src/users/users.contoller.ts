import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { FindAllUsersDto } from './dto/find-all-users.dto';
import { IsPublic } from 'src/auth/decorators';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getUsers(@Query() query: FindAllUsersDto) {
    console.log(query);
    return this.usersService.findAll(query);
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.usersService.findUserById(id);
  }

  @Get(':email')
  async getUserByEmail(@Param('email') email: string) {
    return this.usersService.findUserByEmail(email);
  }

  @IsPublic()
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Put(':id')
  async replaceUser(@Param('id') id: string, @Body() dto: any) {
    return this.usersService.updateUser(id, dto);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}