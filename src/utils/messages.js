const generateMsg = (username,text)=>{
    return{username,text,createAt:new Date().getTime()}
}
const generateLocMsg = (username,url)=>{
    return{username,url,createAt:new Date().getTime()}
}

module.exports = {
    generateMsg,generateLocMsg
}