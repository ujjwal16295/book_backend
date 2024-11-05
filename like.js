const mongoose=require('mongoose')

const likeSchema = new mongoose.Schema({
    book:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Book'
    },
    username:{
        type:String,
        required:true,

    },
    date:{
        type:Date,
        default:Date.now
    }
})

// Create a unique compound index on book and username
likeSchema.index({ book: 1, username: 1 }, { unique: true });

const Like=mongoose.model("Like",likeSchema)
module.exports=Like
