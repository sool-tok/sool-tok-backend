const sinon = require('sinon');
const Controller = require('./users.controller');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');

describe('users controller', () => {
  const GENERATED_TOKEN = 'zxcvbnm';
  const USER = {
    email: 'test@test.com',
    name: 'Ethan Shin',
    photoUrl: 'https://www.example.com',
  };

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
});
