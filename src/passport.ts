import passport from 'passport';
import passportJWT from 'passport-jwt';

const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

require('dotenv').config();

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    function (jwtPayload, callback) {
      if (jwtPayload.userID == process.env.USER_ID) return callback(null, true);
      else return callback(null, false);
    }
  )
);
