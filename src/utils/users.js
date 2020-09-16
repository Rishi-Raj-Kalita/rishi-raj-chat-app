const users=[]

const addUser=({id,username,room})=>{
    //cleaning data
    username=username.trim().toLowerCase()
    room=room.trim().toLowerCase()

    //validate data
    if(!username||!room)
    {
        return{
            error:'Username and Room are required'
        }
    }

    //Check for existing User
    const existingUSer= users.find((user)=>{

        return user.room===room && user.username===username

    })

    //validate user

    if(existingUSer)
    {
        return{
            error:'Username is already in use'
        }
    }

    const user={id,username,room}
    users.push(user)

    return({user})

}

const removeUser=(id)=>{
    const index = users.findIndex((user)=>{
        return user.id===id
    })

    if(index!=-1)
    {
        return users.splice(index,1)[0]   //removing the user at index= index and removing only 1 item starting from the starting index
    }
}

const getUser=(id)=>{
    return users.find((user=>{
        return(user.id===id)
        
    }))
}

const usersInRoom=(room)=>{
    return users.filter((user)=> user.room===room) //shorthand syntax
}

module.exports = {
    addUser,
    getUser,
    usersInRoom,
    removeUser
}