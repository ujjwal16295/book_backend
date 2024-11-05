const mongoose=require('mongoose')
const url = "mongodb+srv://ujjwal:ujjwalthebond@cluster0.ttxeinc.mongodb.net/bookDb?retryWrites=true&w=majority&appName=Cluster0";


const connectToMongo=()=>{
    mongoose.connect(url,{ useUnifiedTopology: true })
    console.log("db connected")
}


module.exports={connectToMongo}
