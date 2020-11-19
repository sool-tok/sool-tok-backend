const { v4: uuidv4 } = require('uuid');
const _ = require('lodash');

const io = require('../configs/socket').getIo();

const members = {
  // [socketId] : { _id, name, phothUrl, roomId, socketId }
};

const rooms = {
  // [roomId] : { _id, title, maxNum, memberList[], isLocked }
};

const isRoomFull = room => room.memberList.length >= room.maxNum;

io.on('connection', socket => {
  socket.on('create room', ({ roomData }, cb) => {
    const roomId = uuidv4();
    const newRoom = {
      ...roomData,
      _id: roomId,
      memberList: [],
      isLocked: false,
    };

    rooms[roomId] = newRoom;
    socket.broadcast.emit('update room list', { rooms: _.values(rooms) });
    return cb({ roomId });
  });

  socket.on('join room', ({ roomId, user }, cb) => {
    if (!(roomId in rooms)) return cb({ message: 'Room is not exist' });

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
      const leavedMember = members[socket.id];

      socket.leave(roomId);
      delete members[socket.id];

      _.remove(rooms[roomId].memberList, member => member.socketId === socket.id);

      console.log(leavedMember, '은(는) 스스로 나갔다..');

      if (_.isEmpty(rooms[roomId].memberList)) {
        delete rooms[roomId];
      } else {
        socket.to(roomId).emit('member leaved', { socketId: socket.id });
      }

      socket.broadcast.emit('update room list', { rooms: _.values(rooms) });
    }
  });

  socket.on('message', ({ chat }) => {
    const { roomId } = members[socket.id];
    io.to(roomId).emit('message', { chat });
  });

  socket.on('update room list', () => {
    io.emit('update room list', { rooms: _.values(rooms) });
  });

  socket.on('disconnect', reason => {
    if (!members[socket.id]) return;
    const leavedMember = members[socket.id];
    const { roomId } = leavedMember;

    if (!rooms[roomId]) return;

    delete members[socket.id];
    _.remove(rooms[roomId].memberList, member => member.socketId === socket.id);

    console.log(leavedMember, '은(는) 끊겼다.. 왜냐하면', reason, '때문에');

    if (_.isEmpty(rooms[roomId].memberList)) {
      delete rooms[roomId];
    } else {
      socket.to(roomId).emit('member leaved', { socketId: socket.id });
    }

    socket.broadcast.emit('update room list', { rooms: _.values(rooms) });
  });
});
