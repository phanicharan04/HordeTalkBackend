import post from "../model/Post.js";
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { json } from "stream/consumers";

dotenv.config()
const cloudname=process.env.CLOUD_NAME
const apikey=process.env.API_KEY
const apisecret=process.env.API_SECRET

const uploadToCloudinary = async (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream((error, result) => {
      if (error) {
        return reject(error);
      }
      
      resolve(result);
    });
    stream.end(buffer);
  });
};

export const addPost = async (req, res) => {
  let {body}=req.body
  body=JSON.parse(body)
  // console.log(body);
  
  const { desc, uId }=body
  let result="";

  try {
    if (req.files) {
      const file = req.files.image; // The uploaded file
      const buffer = file.data; // Access the buffer from the file
  
      // Upload the buffer to Cloudinary
  
      cloudinary.config({
        cloud_name: cloudname,
        api_key: apikey,
        api_secret: apisecret,
      });
  
       result = await uploadToCloudinary(buffer);
      
    }
    const newPost = await post.create({
      desc,
      authorId: uId,
      postImage:result?.url || ""
    });
    res.status(201).send(newPost);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const toggleLikePost = async (req, res) => {
  const { postId } = req.params;
  const userId  = req.userId;

  try {
    const postObject = await post.findById(postId);
    
    if (!postObject) {
      return res.status(404).send({ message: "Post not found" });
    }

    // Check if the user already liked the post
    const isLiked = postObject.likedBy.includes(userId);

    if (isLiked) {
      // If liked, remove the like (dislike)
      const updatedPost = await post.findByIdAndUpdate(
        postId,
        { $pull: { likedBy: userId } },
        { new: true }
      ).populate("likedBy", "-password");

      return res.status(200).send(updatedPost.likedBy);
    } else {
      // If not liked, add the like
      const updatedPost = await post.findByIdAndUpdate(
        postId,
        { $addToSet: { likedBy: userId } },
        { new: true }
      ).populate("likedBy", "-password");

      return res.status(201).send(updatedPost.likedBy);
    }
  } catch (error) {
    return res.status(500).send({ message: "Server Error", error });
  }
};


export const updatePost = async (req, res) => {
    const {postId} = req.params;
    // console.log(postId);
    
    let {body}=req.body
    body= JSON.parse(body);
    const {desc} =body
    
    const newPostObject = await post.findByIdAndUpdate(
        postId,{
            desc:desc
        },
        {
            new : true,
        }
    )
    res.status(201).send(newPostObject)
}

export const viewAllPosts = async (req, res) => {
    const allposts = await post.find().populate("authorId").populate("likedBy")
    res.status(200).send(allposts)
}

export const viewPostById = async (req, res) => {
    const {postId}=req.params

    
    try {
        const currpost = await post.findById({_id:postId})
        res.status(200).send(currpost)
    } catch (error) {
        res.status(404).send(error.message)
    }

}

export const viewPostByAuthor = async (req, res) => {
  const {authorId}=req.params

  
  
  try {
      const currpost = await post.find({authorId:authorId})
      // console.log(currpost);
      
      res.status(200).send(currpost)
  } catch (error) {
      res.status(404).send(error.message)
  }

}

export const deletePost = async (req, res) =>{
    const {postId} = req.params;
    await post.deleteOne({_id:postId})
    res.status(200).send("Post Deleted Successfully...!")
}



export const uploadImg = async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    }

    // console.log(req);
    
    const file = req.files.image; // The uploaded file
    const buffer = file.data; // Access the buffer from the file

    // Upload the buffer to Cloudinary

    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.API_KEY,
      api_secret: process.env.API_SECRET,
    });

    const result = await uploadToCloudinary(buffer);

    res.json({ url: result.secure_url }); // Send back the Cloudinary URL
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

