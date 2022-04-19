"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const passport_1 = __importDefault(require("passport"));
const cors_1 = __importDefault(require("cors"));
const index_1 = __importDefault(require("./routes/index"));
const noteRouter_1 = __importDefault(require("./routes/noteRouter"));
const seriesRouter_1 = __importDefault(require("./routes/seriesRouter"));
const adminRouter_1 = __importDefault(require("./routes/adminRouter"));
require('dotenv').config();
require('./passport');
const mongoose_1 = __importDefault(require("mongoose"));
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};
mongoose_1.default.connect(process.env.DB_CRED, options);
const db = mongoose_1.default.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
const app = (0, express_1.default)();
app.set('views', path_1.default.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.use(passport_1.default.initialize());
app.use(express_1.default.static(path_1.default.join(__dirname, 'client/build')));
app.use((0, cors_1.default)({
    origin: [
        'https://media-map-public-mw.herokuapp.com',
    ],
}));
app.use('/', index_1.default.router);
app.use('/note', noteRouter_1.default.router);
app.use('/series', seriesRouter_1.default.router);
app.use('/admin', adminRouter_1.default.router);
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname + '/client/build/index.html'));
});
app.use(function (req, res, next) {
    next((0, http_errors_1.default)(404));
});
app.use(function (err, req, res) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});
module.exports = app;
