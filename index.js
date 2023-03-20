
const express = require("express");
const app = express();
app.use(express.static("routes"));
app.use(express.urlencoded({ extended: true}));
app.use(express.json());
app.set("view engine", "ejs");

const path = require("path");
const http = require("http");

const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const createAdapter = require("@socket.io/redis-adapter").createAdapter;
const redis = require("redis");
require("dotenv").config();
const { createClient } = redis;
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");



const userRouter = require("./routes/users");
app.use("/users", userRouter);
const userRouterpath = require("./routes/userspath");
app.use("/userspath", userRouterpath);
const ParkedUserRouter = require("./routes/parked/usersparked");
app.use("/usersparked", ParkedUserRouter);
const amUserRouter = require("./routes/alreadymoving/usersam");
app.use("/usersam", amUserRouter);
const destinyUserRouter = require("./routes/destiny/usersd");
app.use("/usersd", destinyUserRouter);
const ccUserRouter = require("./routes/ccharges/userscc");
app.use("/userscc", ccUserRouter);
const statusRouter = require("./routes/status/status");
app.use("/status", statusRouter);




const server = http.createServer(app);
const io = socketio(server);

// Set static folder

const botName = "Reception: ";


// Run when client connects
io.on("connection", (socket) => {
  console.log(io.of("/").adapter);
  socket.on("joinRoom" || "chatMessage", ({ username, room },) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);
 
    // Welcome current user
    socket.emit("message", formatMessage(botName, "Welcome to our travellers' Live chat talk , Let's talk, We are here for you!"));



    // Broadcast when a user connects
    
    // Send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // Listen for chatMessage
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit("message", formatMessage(user.username + " ", msg));
  });

  // Runs when client disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      

      // Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
