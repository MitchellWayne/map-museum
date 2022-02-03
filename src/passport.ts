import passport from 'passport';
import passportJWT from 'passport-jwt';
import bcryptjs from 'bcryptjs';

const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

require('dotenv').config();


