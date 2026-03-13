const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const users = {}; // userId -> socketId

app.get("/", (req, res) => {
  res.send("NexChat Server is Live! 🚀");
});

io.on("connection", (socket) => {

  socket.on("register", (userId) => {
    users[userId] = socket.id;
    io.emit("users", Object.keys(users));
  });

  socket.on("private-message", ({ to, message, from }) => {
    const receiver = users[to];
    if (receiver) {
      io.to(receiver).emit("private-message", { from, message });
    }
  });

  socket.on("disconnect", () => {
    for (let id in users) {
      if (users[id] === socket.id) {
        delete users[id];
      }
    }
    io.emit("users", Object.keys(users));
  });

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("NexChat Server running on port " + PORT);
});