import jwt from 'jsonwebtoken';

const generateToken =(id)=>{
    const jwt_secret=process.env.JWT_SECRET
    return jwt.sign({id},jwt_secret,{
        expiresIn:"1d"
    })
    
}
export default generateToken