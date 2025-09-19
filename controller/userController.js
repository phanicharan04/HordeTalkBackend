import user from "../model/User.js";
import bcrypt from "bcrypt";
import dotenv from 'dotenv';
import generateToken from "../config/token.js";
import { v2 as cloudinary } from 'cloudinary';

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
  
export const signUpUser=async(req,res)=>{
    try {
        const{fname,lname,bio,age,email,password,mobile}=req.body
        // console.log(req.body)
        const isUserExisting=await user.findOne({email:email})
        if(isUserExisting){
            res.status(400).send("User Already Exists")
        }
        else{
            const newUser=await user.create({
                fname,
                lname,
                age,
                email,
                password,
                mobile
            })
            if(newUser)
                res.status(201).json({
                _id:newUser._id,
                fname:newUser.fname
            })
             else
                throw new Error("Unable To Create User")
        }
        
    } catch (error) {
        console.log(error.message)
        res.status(500).send(error.message)
    }
}


export const loginUser = async (req,res)=>{
    const {email,password}=req.body
    
    try {
        const curruser = await user.findOne({
            $or:[
                {email:email}
            ]
        });
        
        if(!curruser){
            res.status(404).send("User Not Found")
        }
        else{
            const hashedpwd = curruser.password
            if(await bcrypt.compare(password,hashedpwd)){
                res.status(200).json({
                    _id:curruser._id,
                    email:curruser.email,
                    bio:curruser.bio,
                    name:curruser.fname+" "+curruser.lname,
                    token:generateToken(curruser?._id)
                })
            }
            else{
                res.status(401).send("Wrong Password")
            }
        }
    } catch (error) {
        res.status(500).send(error.message)
    }
}

export const viewAllUsers=async(req,res)=>{
    const allusers = await user.find()
    res.status(200).send(allusers)
}

export const viewUserById = async (req, res) => {
    try {
        const userId = req.params.userId;
        const userProfile = await user.findById(userId).populate('networks','-password');
        // console.log(userId);
        
        if (!userProfile) {
            return res.status(404).send("User Not Found");
        }

        res.status(200).json({
          userProfile
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
};


export const viewProfile = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(400).send("User ID missing in request.");
        }
        
        const userProfile = await user.findById(userId).populate('networks','-password');

        if (!userProfile) {
            return res.status(404).send("User Not Found");
        }

        res.status(200).json({
          userProfile
        });
    } catch (error) {
        console.error("Error in viewProfile:", error.message); // Log the error message
        res.status(500).send(error.message);
    }
};


export const updateProfile = async (req, res) => {
    try {
      const userId = req.params.userId;
      const { fname, lname, bio, age, email, mobile } = req.body;
      
      const userToUpdate = await user.findById(userId);
      
      if (!userToUpdate) {
        return res.status(404).send("User Not Found");
      }
      
      let filters = {};
      filters.fname = fname || userToUpdate.fname;
      filters.lname = lname || userToUpdate.lname;
      filters.bio = bio || userToUpdate.bio;
      filters.age = age || userToUpdate.age;
      filters.email = email || userToUpdate.email;
      filters.mobile = mobile || userToUpdate.mobile;
      
      // If a profile picture is uploaded, upload it to Cloudinary
      if (req.files && req.files.dp) {
        const file = req.files.dp; // The uploaded profile picture
        const buffer = file.data; // Access the buffer from the file
        
        // Upload the buffer to Cloudinary
        cloudinary.config({
          cloud_name: cloudname,
          api_key: apikey,
          api_secret: apisecret,
        });
        
        const result = await uploadToCloudinary(buffer);
        filters.dp = result?.url || userToUpdate.dp; // Update dp with the Cloudinary URL
      }
      
      const updatedUser = await user.findByIdAndUpdate(userId, filters, { new: true });
      
      res.status(200).json({
        _id: updatedUser._id,
        fname: updatedUser.fname,
        lname: updatedUser.lname,
        bio: updatedUser.bio,
        age: updatedUser.age,
        email: updatedUser.email,
        mobile: updatedUser.mobile,
        dp: updatedUser.dp, // Return the updated dp URL
      });
    } catch (error) {
      res.status(500).send(error.message);
    }
  };

  export const addToNetworks = async (req, res) => {
    const { userId } = req.body; // The user to be added
    const currentUserId = req.userId; // The logged-in user (assuming you have middleware to attach the logged-in user)
  // console.log(userId);
  
    try {
      const networkuser = await user.findByIdAndUpdate(
        currentUserId,
        { $addToSet: { networks: userId } }, // Add to network without duplicates
        { new: true }
      ).populate('networks', '-password'); // Populate networks without passwords
      await user.findByIdAndUpdate(
        userId,
        { $addToSet: { networks: currentUserId } }, // Add to network without duplicates
        { new: true }
      ).populate('networks', '-password'); // Populate networks without passwords
  
      res.status(200).json('Freind Added');
    } catch (error) {
        console.log(error);
        
      res.status(500).json({ message: "Error adding to networks", error });
    }
  };
  
  export const removeFromNetworks = async (req, res) => {
    const { userId } = req.params; 
    const currentUserId = req.userId; 
    
    try {
      // Remove from the current user's network
      const updatedUser = await user.findByIdAndUpdate(
        currentUserId,
        { $pull: { networks: userId } }, 
        { new: true }
      ).populate('networks', '-password'); 
  
      
      await user.findByIdAndUpdate(
        userId,
        { $pull: { networks: currentUserId } }, 
        { new: true }
      ).populate('networks', '-password'); 
  
      res.status(200).json(updatedUser);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error removing from networks", error });
    }
  };
  
  export const search = async (req, res) => {
    try {
      const { name } = req.body;
  
      
      const data = await user.find({
        fname: { $regex: name, $options: 'i' } // 'i' for case-insensitive
      });
  
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  };
  
  export const networkSearch = async (req, res) => {
    try {
        const { name } = req.body;
        const  userId  = req.userId;

        // Find the user to get their networks and include 'dp' field
        const userData = await user.findById(userId).populate('networks'); // Include dp in the populated fields

        if (!userData || !userData.networks) {
            return res.status(404).json({ message: "User or networks not found" });
        }

        // Filter the networks by the name provided (case-insensitive regex search)
        const filteredNetworks = userData.networks.filter(friend =>
            new RegExp(name, 'i').test(friend.fname)
        );

        res.json(filteredNetworks); // Return the filtered networks including dp
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
