

const socket = io()
const msgForm = document.querySelector('#messageForm')
const sendLocation = document.querySelector('#sendLocation')
const sendMsgBtn = document.querySelector('#sendMsgBtn')
const messages = document.querySelector('#messages')
const sidebar = document.querySelector('#sidebar')

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-temaplate').innerHTML

const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoscroll = ()=>{
const newMsg = messages.lastElementChild

const newMsgStyles = getComputedStyle(newMsg)
const newMsgMargin  = parseInt(newMsgStyles.marginBottom)
const newMsgHeight = messages.offsetHeight + newMsgMargin

const visibleHeight= messages.offsetHeight
const containerHeight = messages.scrollHeight

const scrollOffset = messages.scrollTop + visibleHeight
if(containerHeight - newMsgHeight <= scrollOffset){
    messages.scrollTop = messages.scrollHeight
}

}

socket.on('message',(message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createAt:moment(message.createAt).format('HH:mm')
    })
    messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})



socket.on('locationMessage',(message)=>{
    console.log(message);
    const html = Mustache.render(locationMessageTemplate,{
        username:message.username,
        url: message.url,
        createAt:moment(message.createAt).format('HH:mm')
    })
    messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})
socket.on('roomData',({room,users}) =>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    sidebar.innerHTML = html
})
msgForm.addEventListener("submit",(e)=>{
    e.preventDefault()
    sendMsgBtn.setAttribute("disabled",'disabled')
    socket.emit('sendMessage',msgForm.message.value,(error)=>{
        sendMsgBtn.removeAttribute('disabled')
        msgForm.message.value=""
        msgForm.message.focus()
        return error ? console.log(error): console.log('message delivered')
    })

})
sendLocation.addEventListener("click",e=>{
   if(!navigator.geolocation){
       return(alert('geolocation is not supported by your browser'))
   }
   sendLocation.setAttribute("disabled",'disabled')
   navigator.geolocation.getCurrentPosition((pos)=>{
    console.log(pos.coords.latitude)
    console.log(pos.coords.longitude)
    socket.emit('sendLocation',{latitude:pos.coords.latitude,longitude:pos.coords.longitude},()=>{
    setTimeout(async ()=>{
        await sendLocation.removeAttribute('disabled')
    },1000)
    
    console.log('location shared')})
   })

})
socket.emit('join',{username,room},error=>{
if(error){
    location.href ='/'
    alert(error)
}

})