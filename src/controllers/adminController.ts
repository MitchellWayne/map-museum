import * as express from 'express';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';

require('dotenv').config();

// This needs a fix for posting illegal arguments like undefined
async function checkLogin(
  username: string,
  password: string
): Promise<boolean> {
  let valid = false;
  await bcryptjs
    .compare(password, process.env.USER_HASHED_PASSWORD as string)
    .then((result) => {
      if (result && username == process.env.USERNAME) {
        valid = true;
      }
      return valid;
    });
  return valid;
}

export async function login_post(req: express.Request, res: express.Response) {
  const success = await checkLogin(req.body.username, req.body.password);
  if (success) {
    const token = jwt.sign(
      { userID: process.env.USER_ID },
      process.env.JWT_SECRET as string,
      { expiresIn: '12h' }
    );
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 12 * 60 * 60,
    });
    return res.status(200).json({
      message: 'Successfully logged in and attached token to http-only cookie.',
    });
  } else {
    return res.status(401).json({ message: 'Username or Password incorrect' });
  }
}

export function get_mapsAPI(req: express.Request, res: express.Response) {
  return res.status(200).json({ apikey: process.env.MAPS_APIKEY });
}
