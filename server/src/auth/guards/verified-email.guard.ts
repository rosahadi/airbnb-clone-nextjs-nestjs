import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import { User } from 'src/users/entities/user.entity';

interface GqlContext {
  req: Request;
}

@Injectable()
export class VerifiedEmailGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const gqlContext = ctx.getContext<GqlContext>();

    const req = gqlContext.req;
    const user = req.user as User | undefined;

    if (!user) {
      return false;
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Email not verified');
    }

    return true;
  }
}
