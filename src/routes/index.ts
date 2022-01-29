export {};

import express from 'express';
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Map-Museum Express API' });
});

module.exports = router;
