"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login_post = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
require('dotenv').config();
function checkLogin(username, password) {
    return __awaiter(this, void 0, void 0, function* () {
        let valid = false;
        yield bcryptjs_1.default
            .compare(password, process.env.USER_HASHED_PASSWORD)
            .then((result) => {
            if (result && username == process.env.USERNAME) {
                valid = true;
            }
            return valid;
        });
        return valid;
    });
}
function login_post(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const success = yield checkLogin(req.body.username, req.body.password);
        if (success) {
            const token = jsonwebtoken_1.default.sign({ userID: process.env.USER_ID }, process.env.JWT_SECRET, { expiresIn: '12h' });
            return res.status(200).json({ token });
        }
        else {
            return res.status(400).json({ message: 'Username or Password incorrect' });
        }
    });
}
exports.login_post = login_post;
