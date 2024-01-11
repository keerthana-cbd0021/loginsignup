const mongoose=require("mongoose")

mongoose.connect("mongodb://localhost:27017/users")
.then(()=>{
    console.log('mongodb connected');
})
.catch((e)=>{
    console.log('failed to connect');
})

const LogInSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
})

const collection=new mongoose.model("logincollection",LogInSchema)

module.exports=collection