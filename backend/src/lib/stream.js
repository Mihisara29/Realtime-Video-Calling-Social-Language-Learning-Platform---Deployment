import {StreamChat} from "stream-chat";
import "dotenv/config"
import { application } from "express";

const apiKey = process.env.STREAM_API_KEY
const apiSecret = process.env.STREAM_API_SECRET;

if(!apiKey || !apiSecret){
  console.error("Stream API key or Secret is missing");
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData) => {
  try {
    console.log("Calling upsertUser with data:", userData);
    await streamClient.upsertUsers([userData]);
    console.log("Stream user successfully upserted");
    return userData;
  } catch (error) {
    console.error("Error upserting Stream user:", error);
  }
};


export const generateStreamToken = (userId) => {
  try {
    const userIdStr = userId.toString();
    return streamClient.createToken(userIdStr);
  } catch (error) {
   console.log("Error generating Stream token:",error); 
  }
};

export default streamClient;