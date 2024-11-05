const mongoose=require('mongoose')

const bookUserSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        unique:true,
    },
    email:{
        type: String,
        required:true,
        unique:true
    },
    password:{
        type: String,
        required: true,
    },
    date:{
        type:Date,
        default:Date.now
    }
})
const BookUser=mongoose.model("User",bookUserSchema)
module.exports=BookUser