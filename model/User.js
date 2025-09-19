import mongoose from "mongoose";
import bcrypt from 'bcrypt'
//to make blueprint of your collection
const userSchema = new mongoose.Schema(
    {
        "fname": String,
        "lname": String,
        "bio": {type:String
                    },
        "age": Number,
        "email": {type:String,
                  unique:true,
                  required:true
                 },
        "password": String,
        "mobile": {type:String,
                  unique:true,
                  required:true
                 },
        "dp":{
            type:String,
            default:"https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
        },
        networks: [{
            type:mongoose.Schema.Types.ObjectId,
            ref: 'User', // Referencing the User model
          }],
        saves: [{
            type:mongoose.Schema.Types.ObjectId,
            ref: 'Post', // Referencing the User model
          }]
    }
)

userSchema.pre("save",async function(){
    if(!this.isModified("password")){
        next();
    }
    const salt=await bcrypt.genSalt(8);
    this.password=await bcrypt.hash(this.password,salt)
})

//to create collection
const user = mongoose.model("User",userSchema)

//to reuse many times many ways
export default user;