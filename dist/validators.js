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
exports.checkPost = void 0;
const express_validator_1 = require("express-validator");
const series_1 = __importDefault(require("./models/series"));
function checkPost() {
    return [
        (0, express_validator_1.body)('series').custom((seriesID) => __awaiter(this, void 0, void 0, function* () {
            const seriesExists = yield series_1.default.exists({ _id: seriesID });
            if (seriesExists)
                return true;
            else
                return Promise.reject(`Series with ID ${seriesID} does not exist.`);
        })),
        (0, express_validator_1.body)('title', 'Title field must not be empty.')
            .trim()
            .isLength({ min: 1 })
            .escape(),
        (0, express_validator_1.body)('location', 'Location field must not be empty.')
            .trim()
            .isLength({ min: 1 })
            .escape(),
        (0, express_validator_1.body)('synopsis', 'Synopsis field must not be empty.')
            .trim()
            .isLength({ min: 1 })
            .escape(),
        (0, express_validator_1.body)('locdetails', 'Location details field must not be empty.')
            .trim()
            .isLength({ min: 1 })
            .escape(),
        (0, express_validator_1.body)('latlong', 'Invalid longitide / latitude coordinates.')
            .trim()
            .isLatLong(),
    ];
}
exports.checkPost = checkPost;
