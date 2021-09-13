const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const port = process.env.PORT || 3000;
const Filter = require("bad-words");
const publicDirectoryPath = path.join(__dirname, "../public");
const { generateMsg, generateLocMsg } = require("./utils/messages");
const {addUser,removeUser,getUser,getUsersInRoom}  = require("./utils/users");
app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
    console.log("new web socket conection");

    socket.on("join", (options,callback) => {
        const  {error,user} = addUser({id: socket.id, ...options})
        if(error){
            return callback(error)
        }
        socket.join(user.room);

        socket.emit("message", generateMsg('Admin',`Welcome ${user.username}!`));
        socket.broadcast.to(user.room).emit('message', generateMsg('Admin',`${user.username} has joined😍`));
        io.to(user.room).emit("roomData", {room: user.room,users:getUsersInRoom(user.room)});
        callback()
    });

    socket.on("sendMessage", (message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter();
        if (filter.isProfane(message)) {
            return callback("profanity is not allowed!");
        }
        io.to(user.room).emit("message", generateMsg(user.username,message));
       
        callback("delivered");
    });

    socket.on("sendLocation", (coords, cb) => {
        const user = getUser(socket.id)
        io.to(user.room).emit(
            "locationMessage",
            generateLocMsg(user.username,`http://www.google.com/maps?q=${coords.latitude},${coords.longitude}`)
        );
        cb();
    });
    socket.on("disconnect", () => {
       const user =  removeUser(socket.id)
       if(user){
           io.to(user.room).emit("message", generateMsg('Admin',`${user.username} has left the room`));
           io.to(user.room).emit("roomData", {room: user.room,users:getUsersInRoom(user.room)});
       }
    });
});

server.listen(port, () => {
    console.log(`listen to port ${port}`);
});
