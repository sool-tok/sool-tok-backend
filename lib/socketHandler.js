const { v4: uuidv4 } = require('uuid');
const io = require('../configs/socket').getIo();

const clients = {};
const rooms = {};

io.on('connection', socket => {
  socket.on('new user', ({ user }) => {
    const { name } = user;
    clients[socket.id] = name;
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

    rooms[roomId] = newRoom;
    console.log('Current Rooms :', rooms);

    socket.join(roomId);
    cb({ room: newRoom });
  });

  socket.on('join room', ({ roomId, user }, cb) => {
    if (roomId in rooms) {
      socket.join(roomId);
      rooms[roomId].memberList.push(user);
      cb({ room: rooms[roomId] });
    }

    cb({ room: null });
  });

  socket.on('leave room', ({ userId }) => {
    // TODO: Leave Room
  });

  socket.on('disconnect', () => {
    delete clients[socket.id];
    console.log('Client disconnected :', socket.id);
  });
});
