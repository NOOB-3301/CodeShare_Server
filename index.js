import express from 'express'
import { createServer } from 'node:http';
import { Server } from 'socket.io';


const port = process.env.PORT || 3000;

const app = express()

app.get("/",async (req,res) => {
    res.send("socketttt io")
})


const server = createServer(app)

const io = new Server(server)
// io.origins('*:*');


let prevdata=null;

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('join-room', (room)=> {
        console.log("user entered room", room)
        socket.join(room)
        // socket.to(room).emit('user-connected', socket.id)
        io.in(room).emit('user-connected', socket.id)
        if (prevdata != null) {
            socket.emit('code-changed-on-join',prevdata)
        }
    })

    socket.on('get-room-users',(room=>{
        console.log("get room users", room)
        const users = io.sockets.adapter.rooms.get(room)
        console.log("users in room", users)
        socket.emit('room-users', Array.from(users))
    }))


    socket.on('code-changed', (data)=>{
        prevdata= data.code
        console.log("code changed", data)
        socket.to(data.room).emit('code-changed', data.code)
        console.log(prevdata)
    })


});

server.listen(port, () => {
    console.log('server running at http://localhost:3000');
});