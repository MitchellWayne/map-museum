import passport from 'passport';
import passportJWT from 'passport-jwt';
import bcryptjs from 'bcryptjs';

const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

require('dotenv').config();

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      // jwtFromRequest: req => req.cookies.token,
      secretOrKey: process.env.JWT_SECRET,
    },
    function (jwtPayload, callback) {
      if (jwtPayload.user_id == process.env.USER_ID)
        return callback(null, true);
      else return callback(null, false);
      // return User.findOne({ _id: jwtPayload.user_id })
      //   .then((user) => {
      //     return callback(null, user);
      //   })
      //   .catch((err) => {
      //     return callback(err);
      //   });
    }
  )
);
