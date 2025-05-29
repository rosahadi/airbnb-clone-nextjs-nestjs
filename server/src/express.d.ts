import { Request } from 'express';
import { User } from './users/user.entity';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

interface RequestWithCookies extends Request {
  cookies: {
    airbnbCloneJWT?: string;
  };
}
