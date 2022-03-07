"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_jwt_1 = __importDefault(require("passport-jwt"));
const JWTStrategy = passport_jwt_1.default.Strategy;
require('dotenv').config();
passport_1.default.use(new JWTStrategy({
    jwtFromRequest: (req) => req.cookies.token,
    secretOrKey: process.env.JWT_SECRET,
}, function (jwtPayload, callback) {
    if (jwtPayload.userID == process.env.USER_ID)
        return callback(null, true);
    else
        return callback(null, false);
}));
