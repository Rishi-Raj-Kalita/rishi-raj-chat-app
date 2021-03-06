const http = require('http')
const path=require('path')
const express= require('express')
const socketio=require('socket.io')
const Filter =require('bad-words')
const {generateMessage, generateLocationMessage}= require('./utils/messages')
const {addUser,getUser,usersInRoom,removeUser}= require('./utils/users')

const app=express()
const server=http.createServer(app)
const io=socketio(server)

const port = process.env.PORT||3000
const publicDirectoryPath=path.join(__dirname,"../public")

app.use(express.static(publicDirectoryPath))

io.on('connection',(socket)=>{
    console.log('New WebSocket connection')

    socket.on('join',({username,room},callback)=>{

        const{error,user}=addUser({id:socket.id,username,room})

        if(error)
        {
            return callback(error)
        }
        socket.join(user.room)

        socket.emit('message',generateMessage('Admin','Welcome!'))

        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined!`)) //sends message specific to that room to all the users except me

        io.to(user.room).emit('roomData',{
            room:user.room,
            users:usersInRoom(user.room)
            
        })
       
        callback()
    })

    socket.on('sendMessage',(message,callback)=>{
        const user=getUser(socket.id)
        const filter= new Filter()

        if(filter.isProfane(message)){
            return callback('Bad words detected bitch!')
        }

        io.to(user.room).emit('message',generateMessage(user.username,message))
        callback()
    })
    socket.on('sendLocation',(coords,callback)=>{
        const user=getUser(socket.id)
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })
    

    socket.on('disconnect',()=>{
        const user=removeUser(socket.id)
        if(user){
        io.to(user.room).emit('message',generateMessage(user.username,`${user.username} has left the chat`))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:usersInRoom(user.room)
        })
        }
    })

    
    //sending to the server
    /*socket.emit('countUpdated',count)

    socket.on('increment',()=>{
        count++
        //socket.emit('countUpdated',count) //emits to a single connection in the server
        io.emit('countUpdated',count)  //emits to all the connections in the server
    })*/
})

server.listen(port,()=>{
    console.log(`Server is up on port ${port}`)
})