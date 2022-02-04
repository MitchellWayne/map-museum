import * as express from 'express';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';

require('dotenv').config();

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
    return res.status(200).json({ token });
  } else {
    return res.status(400).json({ message: 'Username or Password incorrect' });
  }
}
