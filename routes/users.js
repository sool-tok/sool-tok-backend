const express = require('express');
const router = express.Router();

const userController = require('./controllers/users.controller');
const { verifyToken } = require('./middlewares/authorization');

router.post('/login/google', userController.googleLogin);
router.post('/login/token', userController.tokenLogin);
router.post('/:user_id/logout', verifyToken, userController.logoutUser);
router.get('/:user_id/friends', verifyToken, userController.getFriendList);
router.get('/:user_id/friends/request', verifyToken, userController.getFriendRequestList);
router.post('/:user_id/friends/request', verifyToken, userController.requestFriend);
router.put('/:user_id/friends/request', verifyToken, userController.responseFriendRequest);

module.exports = router;
