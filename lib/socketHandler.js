const { v4: uuidv4 } = require('uuid');
const io = require('../configs/socket').getIo();

const clients = {};
const rooms = {};

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

    clients[socket.id] = { userId: user.id, roomId };
    rooms[roomId].memberList.push(user);

    console.log('Current Clients :', clients);
    console.log('Current Rooms :', rooms);

    io.to(roomId).emit('update memberList', {
      memberList: rooms[roomId].memberList,
    });

    return cb({ room: rooms[roomId] });
  });

  socket.on('leave room', ({ roomId, userId }) => {
    if (roomId in rooms) {
      socket.leave(roomId);

      console.log(clients[socket.id], 'is gone..');
      delete clients[socket.id];
      rooms[roomId].memberList = rooms[roomId].memberList.filter(member => member.id !== userId);

      io.to(roomId).emit('update memberList', {
        memberList: rooms[roomId].memberList,
      });
    }
  });

  socket.on('send message', ({ chat }) => {
    const { roomId } = clients[socket.id];

    io.to(roomId).emit('recieve message', ({ chat }));
  });

  socket.on('disconnect', () => {
    if (!clients[socket.id]) return;

    const { userId, roomId } = clients[socket.id];

    console.log(clients[socket.id], 'is gone..');
    delete clients[socket.id];
    rooms[roomId].memberList = rooms[roomId].memberList.filter(member => member.id !== userId);

    io.to(roomId).emit('update memberList', {
      memberList: rooms[roomId].memberList,
    });
  });
});
