const getSecretRoom = ({ fromUserId, toUserId }) => {
  return (
    [fromUserId, toUserId].sort().join("_") + process.env.SOCKET_ROOM_SECRET
  );
};

module.exports = getSecretRoom;
