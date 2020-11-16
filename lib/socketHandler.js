const { v4: uuidv4 } = require('uuid');
const io = require('../configs/socket').getIo();

const clients = {};
const rooms = {};

io.on('connection', socket => {
  socket.on('new user', ({ userId }) => {
    clients[socket.id] = userId;
    console.log('Current Clients :', clients);
  });

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
    if (roomId in rooms) {
      socket.join(roomId);
      rooms[roomId].memberList.push(user);
      console.log('Current Room :', rooms[roomId]);

      return cb({ room: rooms[roomId] });
    }

    return cb({ room: null });
  });

  socket.on('leave room', ({ roomId, userId }) => {
    if (roomId in rooms) {
      socket.leave(roomId);
      rooms[roomId].memberList = rooms[roomId].memberList.filter(
        member => member.id !== userId,
      );
      console.log(userId, '님이 방에서 나가셨습니다..');
      console.log('Current Room :', rooms[roomId]);
    }
  });

  socket.on('disconnect', () => {
    delete clients[socket.id];
    console.log('Client disconnected :', socket.id);
  });
});
