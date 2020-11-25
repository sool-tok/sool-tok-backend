const _ = require('lodash');
const { v4: uuidv4 } = require('uuid');

const io = require('../configs/socket').getIo();

const { phrases } = require('./phrases.json');

const members = {};
const rooms = {};
const gameMembers = {};

const generateOrderList = list =>
  _.chain(list)
    .map(({ socketId }) => socketId)
    .shuffle()
    .value();

const isRoomFull = room => room.memberList.length >= room.maxNum;

io.on('connection', socket => {
  socket.on('create room', ({ roomData }, cb) => {
    const roomId = uuidv4();
    const newRoom = {
      ...roomData,
      _id: roomId,
      memberList: [],
      isLocked: false,
      filter: null,
    };

    rooms[roomId] = newRoom;
    socket.broadcast.emit('update room list', { rooms: _.values(rooms) });
    return cb({ roomId });
  });

  socket.on('join room', ({ roomId, user }, cb) => {
    if (!(roomId in rooms)) return cb({ message: 'Room does not exist' });

    if (rooms[roomId].isLocked) return cb({ message: 'Room is locked' });

    if (isRoomFull(rooms[roomId])) return cb({ message: 'Room is full' });

    socket.join(roomId);

    const newMember = { ...user, roomId, socketId: socket.id };

    members[socket.id] = newMember;
    rooms[roomId].memberList.push(newMember);

    socket.to(roomId).emit('member joined', { newMember });
    socket.broadcast.emit('update room list', { rooms: _.values(rooms) });
    return cb({ room: rooms[roomId] });
  });

  socket.on('sending signal', ({ signal, receiver }) => {
    const initiator = members[socket.id];
    const { socketId } = receiver;
    io.to(socketId).emit('sending signal', { initiator, signal });
  });

  socket.on('returning signal', ({ signal, receiver }) => {
    const returner = members[socket.id];
    const { socketId } = receiver;
    io.to(socketId).emit('returning signal', { returner, signal });
  });

  socket.on('leave room', ({ roomId }) => {
    if (roomId in rooms) {
      socket.leave(roomId);
      delete members[socket.id];

      _.remove(rooms[roomId].memberList, member => member.socketId === socket.id);

      if (_.isEmpty(rooms[roomId].memberList)) {
        delete rooms[roomId];
      } else {
        socket.to(roomId).emit('member leaved', { socketId: socket.id });
      }

      socket.broadcast.emit('update room list', { rooms: _.values(rooms) });
      io.to(roomId).emit('reset game');
    }
  });

  socket.on('message', ({ chat }) => {
    const { roomId } = members[socket.id];
    io.to(roomId).emit('message', { chat });
  });

  socket.on('video filter', ({ roomId, isFilterOn, filter }) => {
    if (!roomId) return;

    rooms[roomId].filter = isFilterOn ? filter : null;
    io.to(roomId).emit('video filter', { isFilterOn, filter });
  });

  socket.on('update room list', () => {
    io.emit('update room list', { rooms: _.values(rooms) });
  });

  socket.on('update room locking status', ({ roomId, isLocked }) => {
    if (!roomId) return;

    rooms[roomId].isLocked = isLocked;
    io.to(roomId).emit('update room locking status', {
      isLocked: rooms[roomId].isLocked,
    });
  });

  socket.on('start game', ({ title, roomId }) => {
    const shouldMembers = rooms[roomId] && rooms[roomId].memberList.length >= 2;
    if (!shouldMembers) return;

    if (title === 'speechBomb') {
      const explosionTime = _.random(30, 60) * 1000;
      gameMembers[roomId] = generateOrderList(rooms[roomId].memberList);

      io.to(roomId).emit('initializing game', {
        explosionTime,
        initialTurn: gameMembers[roomId][0],
        phrases,
      });
    }
  });

  socket.on('proceed game', status => {
    io.to(status.roomId).emit('proceed game', status);
  });

  socket.on('turn change', status => {
    const { roomId } = status;
    const currentIndex = gameMembers[roomId].findIndex(
      socketId => socketId === socket.id,
    );
    const lastIndex = gameMembers[roomId].length - 1;
    let targetIndex = currentIndex + 1;

    while (!gameMembers[roomId][targetIndex]) {
      targetIndex = currentIndex >= lastIndex ? 0 : currentIndex + 1;
    }

    io.to(roomId).emit('turn change', gameMembers[roomId][targetIndex]);
  });

  socket.on('reset game', roomId => {
    io.to(roomId).emit('reset game');
  });

  socket.on('disconnect', () => {
    if (!members[socket.id]) return;
    const leavedMember = members[socket.id];
    const { roomId } = leavedMember;

    if (!rooms[roomId]) return;

    delete members[socket.id];
    _.remove(rooms[roomId].memberList, member => member.socketId === socket.id);

    if (_.isEmpty(rooms[roomId].memberList)) {
      delete rooms[roomId];
    } else {
      socket.to(roomId).emit('member leaved', { socketId: socket.id });
    }

    socket.broadcast.emit('update room list', { rooms: _.values(rooms) });
    io.to(roomId).emit('reset game');
  });
});
