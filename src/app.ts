import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import passport from 'passport';
import cors from 'cors';

import indexRouter from './routes/index';
import noteRouter from './routes/noteRouter';
import seriesRouter from './routes/seriesRouter';
import adminRouter from './routes/adminRouter';

require('dotenv').config();
require('./passport');

// MongoDB Setup
import mongoose, { ConnectOptions } from 'mongoose';
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
mongoose.connect(process.env.DB_CRED as string, options as ConnectOptions);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, 'client/build')));

app.use(
  cors({
    origin: ['https://media-map-public-mw.herokuapp.com'],
  })
);

// routing
app.use('/', indexRouter.router);
app.use('/note', noteRouter.router);
app.use('/series', seriesRouter.router);
app.use('/admin', adminRouter.router);

// Anything that doesn't match the above, send back client index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (
  err: { message: any; status: any },
  req: express.Request,
  res: express.Response
) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
