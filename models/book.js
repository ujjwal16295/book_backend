const mongoose=require('mongoose')

const bookSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    bookName:{
        type:String,
        required:true,
    },
    summary:{
        type: String,
        required:true,
    },
    name:{
        type:String,
        required:true,
    },
    date:{
        type:Date,
        default:Date.now
    },
    like:{
        default:0,
        type:Number

    }
})
// Create a compound unique index on name and bookName
bookSchema.index({ name: 1, bookName: 1 }, { unique: true });

const Book=mongoose.model("Book",bookSchema)
module.exports=Book
