const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer();
const io = new Server(server, { cors: { origin: "*" } });

const users = {}; // userId -> socketId

io.on("connection", (socket) => {

    socket.on("register", (userId) => {
        users[userId] = socket.id;

        // send updated user list
        io.emit("users", Object.keys(users));
    });

    socket.on("private-message", ({ to, message, from }) => {

        const receiver = users[to];

        if (receiver) {
            io.to(receiver).emit("private-message", {
                from,
                message
            });
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

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});