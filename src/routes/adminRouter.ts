import express from 'express';
const router = express.Router();

const admin_controller = require('../controllers/adminController');

router.post('/login', admin_controller.login_post);

router.get('/mapsAPI', admin_controller.get_mapsAPI);

export default { router };
