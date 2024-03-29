"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const admin_controller = require('../controllers/adminController');
router.post('/login', admin_controller.login_post);
router.get('/mapsAPI', admin_controller.get_mapsAPI);
exports.default = { router };
