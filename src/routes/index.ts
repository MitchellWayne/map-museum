import express from 'express';
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
  res.render('index', { title: 'Map-Museum Express API' });
});

export default { router };
