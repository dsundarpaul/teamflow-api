import { Injectable } from '@nestjs/common';
import { User } from 'generated/prisma/client';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async validateUser(email: string, password: string): Promise<User | null> {

    const user = await this.usersService.findUserByEmail(email);

    if (user && user.password === password) {
      return user;
    }

    return null;
  }
}
