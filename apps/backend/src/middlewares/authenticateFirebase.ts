import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FB_PROJECTID,
    clientEmail: process.env.FB_CLIENTEMAIL,
    privateKey: process.env.FB_PRIVATEKEY
      ? process.env.FB_PRIVATEKEY.replace(/\\n/g, '\n')
      : '',
  }),
});

const authenticateFirebase = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = {
      // uid: decodedToken.uid,
      email: decodedToken.email,
      ...decodedToken,
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized', error });
  }
};

export default authenticateFirebase;
