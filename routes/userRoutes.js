import express from 'express';
import { signUpUser, loginUser, viewAllUsers, viewUserById, updateProfile, viewProfile, addToNetworks, search, removeFromNetworks, networkSearch } from '../controller/userController.js';
import validateToken from '../middleware/authMiddleware.js';

const userRouter=express.Router();

userRouter.route("/signup").post(signUpUser)
userRouter.route("/login").post(loginUser)
userRouter.route("/viewallusers").get(validateToken, viewAllUsers)
userRouter.route("/viewuser/:userId").get(validateToken,viewUserById)
userRouter.route("/viewprofile").get(validateToken,viewProfile)
userRouter.route("/updateprofile/:userId").put(updateProfile)
userRouter.route("/networks").post(validateToken,addToNetworks)
userRouter.route("/removenetwork/:userId").delete(validateToken,removeFromNetworks)
userRouter.route('/search').post(validateToken,search)
userRouter.route('/networksearch').post(validateToken,networkSearch)

export default userRouter;
