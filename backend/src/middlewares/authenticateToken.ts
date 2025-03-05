import { Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client();

// interface GoogleUser {
//   sub: string;
//   name: string;
//   email: string;
// }

// interface RequestWithUser extends Request {
//   user?: GoogleUser;
// }

export const googleAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new Error('No authorization header provided');
    }

    const token = authHeader.split(' ')[1];

    // const ticket = await client.verifyIdToken({
    //   idToken: token,
    //   audience: process.env.GOOGLE_CLIENT_ID,
    // });

    // const payload = ticket.getPayload();
    let payload: any = null;
    await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => response.json())
      .then(data => {
        payload = data;
      })
      .catch(error => {
        console.error('Error fetching user info:', error);
      });

    if (!payload) {
      throw new Error('Invalid or malformed token');
    }
    req.user = {
      sub: payload.sub,
      name: payload.name || 'Unknown',
      email: payload.email || 'N/A',
    };

    next();
  } catch (error) {
    console.error('Google Auth Middleware Error:', error);
    next(error); // Pass the error to Express error handler
  }
};
