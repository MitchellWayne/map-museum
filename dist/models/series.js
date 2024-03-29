"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const seriesSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    notes: [{ type: Schema.Types.ObjectId, ref: 'Note', required: false }],
    image: { type: String, required: false },
    mainImage: { type: String, required: false },
});
exports.default = mongoose_1.default.model('Series', seriesSchema);
