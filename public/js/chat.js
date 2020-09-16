const socket=io()

//Elements
const $messageForm=document.querySelector('#message-form')
const $messageFormInput= $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton=document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//templates
const messageTemplate= document.querySelector('#message-template').innerHTML //innerHTML specifies that the type inside is htm type
const locationMessageTemplate= document.querySelector('#location-message-template').innerHTML
const sidebarTemplate= document.querySelector('#sidebar-template').innerHTML

//OPtions
const{username, room}=  Qs.parse(location.search,{ignoreQueryPrefix:true})  //parsing the query string to give two objects username and room

const autoscroll=()=>{
    //new message
    const $newMessage= $messages.lastElementChild

    //height of the new message(number of message above the new message)

    const newMessageStyles= getComputedStyle($newMessage) //css styles of the new message
    const newMessagesMargin= parseInt(newMessageStyles.marginBottom)
    const newMessageHeight= $newMessage.offsetHeight+newMessagesMargin
    //console.log('Margin',newMessagesMargin)

    //visble height
    const visibleHeight=$messages.offsetHeight

    //height of messages container
    const containerHeight= $messages.scrollHeight

    //how far have i scrolled
                       //amout of messages we have scrolled from the top
    const scrollOffset=$messages.scrollTop+visibleHeight
    
    if(containerHeight-newMessageHeight<=scrollOffset)
    {
        $messages.scrollTop =$messages.scrollHeight
    }

} 

socket.on('locationMessage',(url)=>{
    console.log(url)
    const html= Mustache.render(locationMessageTemplate,{
        username:url.username,
        url:url.locationUrl,
         createdAt:moment(url.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room,users})=>{
    console.log(users)
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
})

//recieving from the server
socket.on('message',(message)=>{
    console.log(message)
    const html= Mustache.render(messageTemplate,{ //setting the value for the message in index.html
        username:message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)  // like whatsapp adds message before the end of the div="messages"
    autoscroll()
})



$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
                                    //name of attribute, any name 
    $messageFormButton.setAttribute('disabled','disable')
    //disable
    const message=e.target.elements.message.value //grabbing elements by name of an element 
    socket.emit('sendMessage',message,(error)=>{  //third function will accept the value provided by the callback function

        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()
        //enable
        if(error)
        {
            return(console.log(error))
        }
        console.log('Message Delivered')
    })
})

$sendLocationButton.addEventListener('click',()=>{
    if(!navigator.geolocation)
    {
        return alert('Geolocation is not supported by your browser')
    }
    $sendLocationButton.setAttribute('disabled','disable')
    navigator.geolocation.getCurrentPosition((position)=>{
        $sendLocationButton.removeAttribute('disabled')
        socket.emit('sendLocation',{
            latitude : position.coords.latitude,
            longitude : position.coords.longitude
        },()=>{
            console.log('Location shared')
        })

    })
})

socket.emit('join',{username,room},(error)=>{
    if(error)
    {
        alert(error)
        location.href='/'
    }

})




/*document.querySelector('#increment').addEventListener('click',()=>{
    console.log('click')
    socket.emit('increment')
})*/