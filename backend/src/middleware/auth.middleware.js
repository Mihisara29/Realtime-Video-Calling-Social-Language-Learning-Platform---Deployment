import jwt from "jsonwebtoken";
import User from "../modules/User.js";

export const protectRoute = async (req,res,next) => {
  try {
    const token = req.cookies.jwt;
    console.log("Token in protectRoute:", token);
    if(!token){
      return res.status(401).json({message: "Unauthorized - No token provided"})
    }
    const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY);
    console.log("Decoded token:", decoded);

    if(!decoded){
        return res.status(401).json({message: "Unauthorized - Invalid token"});
    }

    const user = await User.findOne({ _id: decoded.userId }).select("-password");
    console.log("User found:", user);


    if(!user){
      return res.status(401).json({message: "Unathorize - User not found"});
    }

    req.user = user;

    next();

  } catch (error) {
    console.log("Error in protectRoute middleware",error);
    res.status(500).json({message:"Internal Server Error"});
  }
}