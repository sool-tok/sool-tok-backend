const { v4: uuidv4 } = require('uuid');
const io = require('../configs/socket').getIo();

const members = {
  // [socketId] = {userId,roomId}
};

const rooms = {
  // roomName
  // maxNum
  // id
  // memberList : [{id,name,photoUrl,socketId}]
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
    console.log('Current Rooms :', rooms);

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

    members[socket.id] = { userId: user.id, roomId };
    rooms[roomId].memberList.push({ ...user, socketId: socket.id });

    console.log('📌 : rooms[roomId].memberList', rooms[roomId].memberList);

    io.to(roomId).emit('member joined', {
      joinedMember: { ...user, socketId: socket.id },
    });

    return cb({ room: rooms[roomId] });
  });

  socket.on('sending signal', ({ caller, receiver, signal }) => {
    console.log('📌 : caller', caller);
    console.log('📌 : receiver', receiver);
    console.log('📌 : signal', signal);
    io.to(receiver).emit('receiving signal', { caller, signal });
  });

  socket.on('returning signal', ({ caller, signal }) => {
    io.to(caller).emit('receiving returned signal', { id: socket.id, signal });
  });

  socket.on('leave room', ({ roomId, userId }) => {
    if (roomId in rooms) {
      const leavedMember = members[socket.id];

      socket.leave(roomId);
      rooms[roomId].memberList = rooms[roomId].memberList.filter(
        member => member.id !== userId,
      );
      delete members[socket.id];

      console.log(leavedMember, 'is gone..');

      io.to(roomId).emit('member leaved', { leavedMember });
    }
  });

  socket.on('disconnect', () => {
    if (!members[socket.id]) return;

    const leavedMember = members[socket.id];
    const { userId, roomId } = leavedMember;

    rooms[roomId].memberList = rooms[roomId].memberList.filter(
      member => member.id !== userId,
    );
    delete members[socket.id];

    console.log(leavedMember, 'is gone..');

    io.to(roomId).emit('member leaved', { leavedMember });
  });
});
