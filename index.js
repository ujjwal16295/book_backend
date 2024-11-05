const express= require('express')
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require('cors');
const { connectToMongo } = require('./db')
const bcrypt = require('bcryptjs');
const BookUser = require('./models/user');
const Book = require('./models/book');
// const { any } = require('webidl-conversions');
const Like = require('./like');
const { generateToken, verifyToken } = require('./jwt/jwt');





const app = express()

// Enable CORS for all routes
app.use(cors());

//to extract value from body from api request body parser has now deprecated
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 


connectToMongo();

const BARD_KEY = "AIzaSyBLNPdARB3eSPsEqsIszVfXrgnvcMe-mCw"

app.get("/bookSummary",async(req,res)=>{
let success=false
console.log("hit")
try{
    const genAI = new GoogleGenerativeAI(BARD_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const book = req.query.bookname
    const prompt = `Give summary of ${book} in breif and in one long paragraph of 100 words`;
    
    const result = await model.generateContent(prompt);
    success=true
    res.send({response:result,success:success})
}catch(error){
    success=false
    res.send({error:"unable to generate summary",success:success})



}

// console.log(result.response.text());

})


app.post("/signin",async(req,res)=>{

let success=false
const username  = req.body.username
const email= req.body.email
const password = req.body.password

console.log(password)


const salt = await bcrypt.genSalt(10)
const secPass= await bcrypt.hash(password,salt)

try{
   let user = await  BookUser.create({
        name : username,
        password : secPass,
        email : email
      })
    const token = generateToken(user)
    success=true
    res.json({success,username,email,id:user._id,token})

}catch(error){

    success=false
    res.json({success,error:"email or username already exists in databse"})
     
}



})


app.post("/login",async(req,res)=>{

    let success=false
    const username  = req.body.username
    const password = req.body.password



    try{
    const user= await BookUser.findOne({name:username})

    if(user){
        const passforcheck=await bcrypt.compare(password,user.password)

        if(passforcheck){
            const token = generateToken(user)
            success=true
            res.json({success,username,email:user.email,id:user._id,token})

        }else{
            success=false
            res.json({success,error:"wrong password"})
        }


    }else{
        success=false
        res.json({success,error:"username doesnt exist in database"})

    }

    }catch(error){
        success=false
        res.json({success,error:"database error"})
    } 
    })

app.post("/verify",async(req,res)=>{
    const authHeader = req.headers['authorization'];
    let success=false

  
    // Check if the Authorization header is present and starts with "Bearer"
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        success=false
      return res.status(403).json({ success,error: 'No token provided or token is invalid' });
    }
  
    // Extract the token from the Authorization header
    const token = authHeader.split(' ')[1];


    if(token){
        const data  =  await verifyToken(token)

        console.log(data)
    if(data.error==true){

        success=false
        res.json({success,error:"email or username already exists in databse"})

    }else{

        success=true
        res.json({success,username:data.data.username,email:data.data.email,id:data.data.id,token})

    }
    }
  

})    






app.post("/summary",async(req,res)=>{

        let success = false
        
        let summary = req.body.summary
        let name = req.body.name
        let id = req.body.id
        let bookname  = req.body.bookName

        console.log(req.body)


        try{
            await  Book.create({
                user:id,
                summary : summary,
                name : name,
                bookName : bookname,
              })   
         
             success=true
             res.json({success})
         
         }catch(error){

            if(error.code==11000){
                success=false
                res.json({success,error:"you have already added your sumary"})
   
                console.log(error)

            }else{

                success=false
                res.json({success,error:"failed to store summary in database"})
    
                console.log(error)

            }
         
              
         }



    })

app.get("/userbooksummary",async(req,res)=>{

    let success = false
    let bookName =req.query.bookname
     
    try{
        
        let allBooks =  await Book.find({bookName:bookName})
    
        if(allBooks){
            success=true
            res.json({success,allBooks})
        }else{
            success=true
            res.json({success,allBooks:[]})
        }
    }catch(error){
        success=false
        console.log(error)
        res.json({success,error})
    }

})

app.get("/usersummary",async(req,res)=>{
    let success = false
    let id  = req.query.id

    try{

        let userSummaries =  await Book.find({user:id})
        if(userSummaries){
            success=true
            res.json({success,userSummaries})
        }else{
            success=true
            res.json({success,userSummaries:[]})
        }

    }catch(error){

        success=false
        res.json({success,error})

    }

})

app.put("/usersummary",async(req,res)=>{
    let summary = req.body.summary
    let id = req.body.id
    let success = false
    console.log(summary)
    console.log(id)
    try{
         const updatedBook = await Book.findByIdAndUpdate(id,{summary:summary},{new:true})
         success=true
         res.json({success})
    }catch(error){
        success=false
        console.log(error)
        res.json({success,error:"unable to update the summary"})
    }
})

app.post("/like",async(req,res)=>{

    const bookId = req.body.bid
    const username = req.body.username
    const buttonMode = req.body.buttonMode
    let success= false
    let userLikeExists = false


    if(buttonMode=="like"){
        try{
            const like=await Like.create({
                book:bookId,
                username:username
            })
            
            const updateLike = await Book.findByIdAndUpdate(bookId,{ $inc: { like: 1 } },{new:true})


    
    
            success=true
            userLikeExists=true
            res.json({success,likeValue:updateLike.like,userLikeExists})
        }catch(error){
    
            success=false
            console.log(error)
            res.json({success,error:error})
    
        }

    }else if(buttonMode=="dislike"){
        try{
            const deletedLike = await Like.findOneAndDelete({ book: bookId, username: username });
            
            const updateLike = await Book.findByIdAndUpdate(bookId,{ $inc: { like: -1 } },{new:true})
            
            
            success=true
            userLikeExists=false
            res.json({success,likeValue:updateLike.like,userLikeExists})
        }catch(error){
            
            success=false
            console.log(error)
            res.json({success,error:error})
            
        }

    }



})


app.get("/like",async(req,res)=>{

    let bookId = req.query.bid
    let username = req.query.username
    console.log("biddd"+bookId)
    let success= false

    let userLikeExists= false

    try{
        const like=await Book.findById(bookId)

        if(username){

            const userLike = await Like.findOne({ book: bookId, username: username });
            if(userLike){
                userLikeExists=true
            }else{
                userLikeExists=false
            }
        }



        


        success=true
        res.json({success,likeValue:like.like,userLikeExists})
    }catch(error){

        success=false
        console.log(error)
        res.json({success,error:error})

    }

})


app.get("/likeBooks",async(req,res)=>{
    let username = req.query.username
    let success = false

    try{
        let books = await Like.find({username:username}).populate("book")
        success= true
        if(books){
            res.json({success,books})
        }else{
            res.json({success,books:[]})
        }
    }catch(error){

        success = false
        console.log(error)
        res.json({success,error:error})

    }
})



app.listen(8000,()=>{
    console.log("server has started")
})