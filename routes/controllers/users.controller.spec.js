const sinon = require('sinon');
const Controller = require('./users.controller');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');

const { MESSAGE, RESULT_OK } = require('../../configs/constants');

describe('users controller', () => {
  const GENERATED_TOKEN = 'zxcvbnm';
  const USER = {
    email: 'test@test.com',
    name: 'Ethan Shin',
    photoUrl: 'https://www.example.com',
  };
  const FRIEND_EMAIL = 'friend@gmail.com';

  let req = {};
  let res = {};
  let next;
  let expectedResult;

  describe('googleLogin', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
      req = { body: USER };
      res = { status: sinon.stub().returns({ json: sinon.spy() }) };
      next = sinon.spy();
      expectedResult = {
        _id: 'abc123',
        email: 'test@test.com',
        name: 'Ethan Shin',
        photoUrl: 'https://www.example.com',
        friendList: [],
        friendRequestList: [],
        isOnline: false,
        save: sinon.spy(),
      };
    });

    afterEach(() => sandbox.restore());

    it('should regist new user and return generated token when the user no exist in DB', async () => {
      sandbox.stub(User, 'findOne').resolves(null);
      sandbox.stub(User, 'create').resolves(expectedResult);
      sandbox.stub(jwt, 'sign').returns(GENERATED_TOKEN);

      await Controller.googleLogin(req, res, next);

      sinon.assert.calledWith(res.status, 201);
      sinon.assert.match(res.status().json.args[0][0].token, GENERATED_TOKEN);
      sinon.assert.match(res.status().json.args[0][0].user, expectedResult);
    });

    it('should return generated token user exists', async () => {
      sandbox.stub(User, 'findOne').resolves(expectedResult);
      sandbox.stub(jwt, 'sign').returns(GENERATED_TOKEN);

      await Controller.googleLogin(req, res, next);

      sinon.assert.calledWith(res.status, 200);
      sinon.assert.match(res.status().json.args[0][0].token, GENERATED_TOKEN);
      sinon.assert.match(res.status().json.args[0][0].user, expectedResult);
      sinon.assert.match(res.status().json.args[0][0].user.isOnline, true);
    });

    it('should execute next function on server error', async () => {
      sandbox.stub(User, 'findOne').throws();
      await Controller.googleLogin(req, res, next);
      sinon.assert.calledOnce(next);
    });
  });

  describe('tokenLogin', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
      req = { body: { token: GENERATED_TOKEN } };
      res = { status: sinon.stub().returns({ json: sinon.spy() }) };
      next = sinon.spy();
      expectedResult = {
        _id: 'abc123',
        email: 'test@test.com',
        name: 'Ethan Shin',
        photoUrl: 'https://www.example.com',
      };
    });

    afterEach(() => sandbox.restore());

    it('should return user info', async () => {
      sandbox.stub(jwt, 'verify').returns(expectedResult);

      await Controller.tokenLogin(req, res, next);

      sinon.assert.calledWith(res.status, 200);
      sinon.assert.match(res.status().json.args[0][0].token, GENERATED_TOKEN);
      sinon.assert.match(res.status().json.args[0][0].user, expectedResult);
    });

    it('should execute next function when bad request', async () => {
      req = { body: {} };
      await Controller.tokenLogin(req, res, next);

      sinon.assert.calledOnce(next);
      sinon.assert.match(next.args[0][0].status, 400);
    });

    it('should execute next function when token is invalid', async () => {
      sandbox.stub(jwt, 'verify').throws();

      await Controller.tokenLogin(req, res, next);

      sinon.assert.calledOnce(next);
      sinon.assert.match(next.args[0][0].status, 401);
    });
  });

  describe('logout', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
      req = { params: { user_id: '1234' } };
      res = { status: sinon.stub().returns({ json: sinon.spy() }) };
      next = sinon.spy();
      expectedResult = {
        _id: 'abc123',
        email: 'test@test.com',
        name: 'Ethan Shin',
        photoUrl: 'https://www.example.com',
        friendList: [],
        friendRequestList: [],
        isOnline: false,
        save: sinon.spy(),
      };
    });

    afterEach(() => sandbox.restore());

    it('should logout the user', async () => {
      sandbox.stub(User, 'findById').resolves(expectedResult);
      await Controller.logoutUser(req, res, next);
      sinon.assert.calledWith(res.status, 200);
    });

    it('should execute next function on server error', async () => {
      sandbox.stub(User, 'findById').throws();
      await Controller.logoutUser(req, res, next);
      sinon.assert.calledOnce(next);
    });
  });

  describe('getFriendList', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
      req = { params: { user_id: '1234' } };
      res = { status: sinon.stub().returns({ json: sinon.spy() }) };
      next = sinon.spy();
      expectedResult = [{}, {}, {}];
    });

    afterEach(() => sandbox.restore());

    it('should get friend list', async () => {
      sandbox.stub(User, 'findById').callsFake(() => ({
        populate: () => ({ friendList: expectedResult }),
      }));

      await Controller.getFriendList(req, res, next);

      sinon.assert.calledWith(res.status, 200);
      sinon.assert.match(res.status().json.args[0][0].friendList, expectedResult);
    });

    it('should execute next function on server error', async () => {
      sandbox.stub(User, 'findById').throws();

      await Controller.getFriendList(req, res, next);

      sinon.assert.calledOnce(next);
    });
  });

  describe('getFriendRequestList', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
      req = { params: { user_id: '1234' } };
      res = { status: sinon.stub().returns({ json: sinon.spy() }) };
      next = sinon.spy();
      expectedResult = [{}, {}, {}];
    });

    afterEach(() => sandbox.restore());

    it('should get friend request list', async () => {
      sandbox.stub(User, 'findById').callsFake(() => ({
        populate: () => ({ friendRequestList: expectedResult }),
      }));

      await Controller.getFriendRequestList(req, res, next);

      sinon.assert.calledWith(res.status, 200);
      sinon.assert.match(res.status().json.args[0][0].friendRequestList, expectedResult);
    });

    it('should execute next function on server error', async () => {
      sandbox.stub(User, 'findById').throws();

      await Controller.getFriendRequestList(req, res, next);

      sinon.assert.calledOnce(next);
    });
  });

  describe('requestFriend', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
      req = { params: { user_id: '1234' }, body: { email: FRIEND_EMAIL } };
      res = { status: sinon.stub().returns({ json: sinon.spy() }) };
      next = sinon.spy();
      expectedResult = {
        name: 'Dohee Kim',
        email: 'dohee@gmail.com',
        friendList: [],
        friendRequestList: [],
        save: sinon.spy(),
      };
    });

    afterEach(() => sandbox.restore());

    it('should throw error when the target user no exist in DB', async () => {
      sandbox.stub(User, 'findOne').resolves(null);

      await Controller.requestFriend(req, res, next);

      sinon.assert.calledOnce(next);
    });

    it('should throw error when the user already friend with target user', async () => {
      sandbox.stub(User, 'findOne').resolves(expectedResult);
      sandbox.stub(expectedResult.friendList, 'includes').returns(true);

      await Controller.requestFriend(req, res, next);

      sinon.assert.calledOnce(next);
      sinon.assert.match(next.args[0][0].message.includes(MESSAGE.FRIEND_REQUEST.ALREADY_FRIEND(expectedResult.name)), true);
    });

    it('should throw error when the user request friend by self', async () => {
      req = { ...req, body: { email: 'dohee@gmail.com' } };

      sandbox.stub(User, 'findOne').resolves(expectedResult);
      sandbox.stub(expectedResult.friendList, 'includes').returns(false);
      sandbox.stub(User, 'findById').resolves(expectedResult);

      await Controller.requestFriend(req, res, next);

      sinon.assert.calledOnce(next);
      sinon.assert.match(next.args[0][0].message.includes(MESSAGE.FRIEND_REQUEST.TO_ME), true);
    });

    it('should throw error when the user already request friend', async () => {
      expectedResult.friendRequestList.addToSet = () => {};

      sandbox.stub(User, 'findOne').resolves(expectedResult);
      sandbox.stub(expectedResult.friendList, 'includes').returns(false);
      sandbox.stub(User, 'findById').resolves(expectedResult);

      sandbox.stub(expectedResult.friendRequestList, 'addToSet').returns([]);

      await Controller.requestFriend(req, res, next);

      sinon.assert.calledOnce(next);
      sinon.assert.match(next.args[0][0].message.includes( MESSAGE.FRIEND_REQUEST.ALREADY_REQUESTED(expectedResult.name)), true);
    });

    it('should post friend request', async () => {
      expectedResult.friendRequestList.addToSet = () => {};

      sandbox.stub(User, 'findOne').resolves(expectedResult);
      sandbox.stub(expectedResult.friendList, 'includes').returns(false);
      sandbox.stub(User, 'findById').resolves(expectedResult);

      sandbox.stub(expectedResult.friendRequestList, 'addToSet').returns([{}]);

      await Controller.requestFriend(req, res, next);

      sinon.assert.calledWith(res.status, 200);
      sinon.assert.match(res.status().json.args[0][0].message, MESSAGE.FRIEND_REQUEST.SUCCESS(expectedResult.name));
    });

    it('should execute next function on server error', async () => {
      sandbox.stub(User, 'findOne').throws();
      sandbox.stub(User, 'findById').throws();

      await Controller.requestFriend(req, res, next);

      sinon.assert.calledOnce(next);
    });
  });

  describe('responseFriendRequest', () => {
    let sandbox;
    let IS_APPEPTED;
    let TARGET_USER_ID = '123';

    beforeEach(() => {
      sandbox = sinon.createSandbox();
      req = { params: { user_id: '1234' }, body: { isAccepted: IS_APPEPTED, target_user_id: TARGET_USER_ID } };
      res = { status: sinon.stub().returns({ json: sinon.spy() }) };
      next = sinon.spy();
      expectedResult = {
        name: 'Dohee Kim',
        email: 'dohee@gmail.com',
        friendList: [],
        friendRequestList: [],
        save: sinon.spy(),
      };
    });

    afterEach(() => sandbox.restore());

    it('should update friend list when accept friend request', async () => {
      req = { ...req, body: { isAccepted: true, target_user_id: TARGET_USER_ID}};
      expectedResult.friendList.push = () => {};
      expectedResult.friendRequestList.pull = () => {};

      sandbox.stub(expectedResult.friendList, 'push').returns(expectedResult);

      sandbox.stub(User, 'findById').resolves(expectedResult).callsFake(() => ({
        execPopulate: () => ({ friendRequestList: expectedResult }),
      }));

      await Controller.responseFriendRequest(req, res, next);

      sandbox.stub(expectedResult.friendRequestList, 'pull').returns(expectedResult);

      console.log(next.args[0][0]);
      sinon.assert.calledOnce(next);
    });

    xit('should update friend request list when deny friend request', async () => {
      expectedResult.friendRequestList.pull = () => {};
      sandbox.stub(User, 'findOne').resolves(expectedResult);
      sandbox.stub(expectedResult.friendList, 'includes').returns(true);

      sandbox.stub(expectedResult.friendList, 'pull').returns(true);
      sandbox.stub(User, 'findById').callsFake(() => ({
        execPopulate: () => ({ friendRequestList: expectedResult }),
      }));

      await Controller.responseFriendRequest(req, res, next);

      sinon.assert.calledOnce(next);
      sinon.assert.match(next.args[0][0].message.includes(MESSAGE.FRIEND_REQUEST.ALREADY_FRIEND(expectedResult.name)), true);
    });

    it('should execute next function on server error', async () => {
      sandbox.stub(User, 'findById').throws();

      await Controller.responseFriendRequest(req, res, next);

      sinon.assert.calledOnce(next);
    });
  });


});
