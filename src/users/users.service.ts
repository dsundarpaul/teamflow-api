import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma.service';
import { contains } from 'class-validator';
import { FindAllUsersDto } from './dto/find-all-users.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: createUserDto.password,
        username: createUserDto.username,
        avatar: '',
      },
    });

    return user;
  }

  async findAll(query: FindAllUsersDto) {
    return await this.prisma.user.findMany({
      skip: Number(query.page) * Number(query.limit),
      take: Number(query.limit),
      orderBy: {
        username: query.sort,
      },
      where: {
        role: query.role,
      },
    });
  }

  async findUserById(id: string) {
    return await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async findUserByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findUserByUsername(username: string) {
    return await this.prisma.user.findUnique({
      where: {
        username,
      },
    });
  }

  async updateUser(id: string, data: any) {
    console.log('UpdateUser called with ID:', id);
    console.log('Data received for update:', data);

    return await this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async deleteUser(id: string) {
    return await this.prisma.user.delete({
      where: { id },
    });
  }
  // SEARCH + GET ALL
  //   async findALL(query: any) {
  //     const { search = '' } = query;

  //     const where: any = {};

  //     if (search) {
  //       where.OR = [
  //         { email: { contains: search, mode: 'insensitive' } },
  //         { username: { contains: search, mode: 'insensitive' } },
  //       ];
  //     }

  //     return await this.prisma.user.findMany({ where });
  //   }
}
