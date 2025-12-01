import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { jwtConstants } from '../constants';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    return true;
  }
}
