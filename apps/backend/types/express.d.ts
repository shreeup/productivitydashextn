import * as express from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email?: string;
        [key: string]: any; // Add this to accommodate other Firebase token fields
      };
    }
  }
}
