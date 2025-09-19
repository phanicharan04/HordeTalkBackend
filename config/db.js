import mongoose from "mongoose";

const connectdb = async ()=>{
    const uri=process.env.DB_URI;
    try {
        const con = await mongoose.connect(uri)
        console.log("DB connected successfully"+con.connection.host);
        
    } catch (error) {
        console.log(error.message);
        process.exit(1);
    }
}

export default connectdb;