import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
    {
        "desc" : String,
        "postImage":String,
        "authorId": {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        likedBy: [{
            type:mongoose.Schema.Types.ObjectId,
            ref: 'User', // Referencing the User model
          }]

    },
    {timestamps:true}
)

const post = mongoose.model("Post",postSchema)

export default post;