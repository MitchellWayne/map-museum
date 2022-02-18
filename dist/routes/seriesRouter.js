"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const router = express_1.default.Router();
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: storage });
const validators_1 = require("../validators");
const seriesController = __importStar(require("../controllers/seriesController.js"));
router.get('/', seriesController.serieslist_get);
router.post('/', passport_1.default.authenticate('jwt', { session: false }), upload.single('imgfile'), (0, validators_1.checkSeries)(), seriesController.series_post);
router.put('/:seriesID', passport_1.default.authenticate('jwt', { session: false }), upload.single('imgfile'), seriesController.series_put);
router.delete('/:seriesID', passport_1.default.authenticate('jwt', { session: false }), seriesController.series_delete);
router.get('/:seriesID/image/:key', seriesController.seriesimage_get);
exports.default = { router };
