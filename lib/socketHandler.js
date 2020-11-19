const { v4: uuidv4 } = require('uuid');
const io = require('../configs/socket').getIo();

const members = {
  // [socketId] : { id, name, roomId }
};

const rooms = {
  // id
  // roomName
  // maxNum
  // memberList : [{ id, name, socketId }]
  // isLocked
};

io.on('connection', socket => {
  socket.on('create room', ({ roomData }, cb) => {
    const roomId = uuidv4();
    const newRoom = {
      ...roomData,
      id: roomId,
      memberList: [],
      isLocked: false,
    };

    socket.join(roomId);
    rooms[roomId] = newRoom;

    io.emit('update room list', { rooms: Object.values(rooms) });
    return cb({ room: newRoom });
  });

  socket.on('join room', ({ roomId, user }, cb) => {
    if (!(roomId in rooms)) {
      return cb({ message: 'Room is not exist' });
    }

    if (rooms[roomId].memberList.length >= rooms[roomId].maxNum) {
      return cb({ message: 'Room is full' });
    }

    socket.join(roomId);

    members[socket.id] = { ...user, roomId };
    rooms[roomId].memberList.push({ ...user, socketId: socket.id });

    socket.to(roomId).emit('member joined', { user });
    io.emit('update room list', { rooms: Object.values(rooms) });
    return cb({ room: rooms[roomId] });
  });

  // sending signal : Sender ----(sender's Signal)----> Receiver
  socket.on('sending signal', ({ sender, senderSignal, receiver }) => {
    const { socketId } = receiver;
    io.to(socketId).emit('receiving signal', { sender, senderSignal });
  });

  // returning signal : Receiver ----(receiver's Signal)----> Sender
  socket.on('returning signal', ({ receiver, receiverSignal, sender }) => {
    const { socketId } = sender;
    io.to(socketId).emit('receiving returned signal', { receiver, receiverSignal });
  });

  socket.on('leave room', ({ roomId, userId }) => {
    if (roomId in rooms) {
      socket.leave(roomId);
      rooms[roomId].memberList = rooms[roomId].memberList.filter(
        member => member.id !== userId,
      );

      console.log(members[socket.id], '는 떠났다..');
      delete members[socket.id];

      if (!rooms[roomId].memberList.length) {
        delete rooms[roomId];
      } else {
        socket.to(roomId).emit('member leaved', { userId });
      }

      io.emit('update room list', { rooms: Object.values(rooms) });
    }
  });

  socket.on('send message', ({ chat }) => {
    const { roomId } = members[socket.id];
    io.to(roomId).emit('recieve message', { chat });
  });

  socket.on('update room list', () => {
    io.emit('update room list', { rooms: Object.values(rooms) });
  });

  socket.on('send room locking status', ({ roomId, isLocked }) => {
    if (!roomId) return;

    rooms[roomId].isLocked = isLocked;
    io.to(roomId).emit('receive room locking status', { isLocked: rooms[roomId].isLocked });
  });

  socket.on('disconnect', () => {
    if (!members[socket.id]) return;

    const leavedMember = members[socket.id];
    const { id: userId, roomId } = leavedMember;

    rooms[roomId].memberList = rooms[roomId].memberList.filter(
      member => member.id !== userId,
    );

    console.log(leavedMember, '는 떠났다..');
    delete members[socket.id];

    if (!rooms[roomId].memberList.length) {
      delete rooms[roomId];
    } else {
      socket.to(roomId).emit('member leaved', { userId });
    }

    io.emit('update room list', { rooms: Object.values(rooms) });
  });
});
