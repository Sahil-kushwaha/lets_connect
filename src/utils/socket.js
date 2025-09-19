const server = require("socket.io");
const getSecretRoom = require("./getSecretRoom");
const Chat = require("../models/chat.model");
const logger = require("pino")();
const ConnectionRequest = require("../models/connectionRequest.model");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken")
const cookie  = require("cookie")
const initializeSocketServer = (httpServer) => {
  const io = server(httpServer, {
    cors: {
      origin: process.env.ORIGIN,
      credentials: true,
    },
  });

  //middware for authenticate socket
  io.use(async (socket, next) => {
    try {
      const cookies = cookie.parse(socket.request.headers.cookie)
      const accessToken = cookies?.token
      if (!accessToken) {
         next(new Error("Invalid token or token expired"));
      }
      const decodedData = jwt.verify(accessToken, process.env.JWT_SECRET);
      const user = await User.findById(decodedData?._id).select("-password");
      if (!user) {
         next(new Error("User does'nt exist"));
      }
      socket.user = user;
      next();
    } catch (error) {
          logger.info("middleware Error ::" + (error.message || "Unauthorized"))
          next(new Error(error.message || "Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    // create room on joinroom event
    socket.on("joinChat", async ({ fromUserId, toUserId }) => {
      try {
        // check  fromUseId and toUserId must be  friend
        const request = await ConnectionRequest.findOne({
          $or: [
            { fromUserId, toUserId, status: "accepted" },
            { fromUserId: toUserId, toUserId: fromUserId, status: "accepted" },
          ],
        });
        if (!request) {
          return;
        }
        const room = getSecretRoom({ fromUserId, toUserId });
        socket.join(room);
        logger.info(socket.id + "have join room " + room);
      } catch (error) {
        logger.info(error.message);
      }
    });

    // broadcast message only to the room whenever message arrive and saved in database
    socket.on("sendMessage", async ({ fromUserId, toUserId, text }) => {
      try {
        // check  fromUseId and toUserId must be  friend
        const request = await ConnectionRequest.findOne({
          $or: [
            { fromUserId, toUserId, status: "accepted" },
            { fromUserId: toUserId, toUserId: fromUserId, status: "accepted" },
          ],
        });
        if (!request) {
          return;
        }
        let chat = await Chat.findOneAndUpdate(
          {
            participents: { $all: [fromUserId, toUserId] },
          },
          {
            $push: {
              messages: { senderId: fromUserId, text },
            },
          }
        );

        if (!chat) {
          chat = new Chat({
            participents: [fromUserId, toUserId],
            messages: [{ senderId: fromUserId, text }],
          });
          chat = await chat.save();
        }
        const user = socket.user
        const fullName = user.firstName+" "+user.lastName
        const room = getSecretRoom({ fromUserId, toUserId });
        socket.to(room).emit("messageReceived", {text,fullName});
      } catch (error) {
        logger.info(error.message);
      }
    });
  });
};

module.exports = initializeSocketServer;
