import express from 'express';
const router = express.Router();
import passport from 'passport';

const admin_controller = require('../controllers/adminController');

router.post('/login', admin_controller.login_post);
router.post(
  '/logout',
  passport.authenticate('jwt', { session: false }),
  admin_controller.logout_post
);

export default { router };
