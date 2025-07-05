import User from "../modules/User.js";
import FriendRequest from "../modules/FriendRequest.js";

export async function getRecommendedUsers(req,res){

try {
  const currentUserId = req.user.id;
  const currentUser = req.user;

const recommendedUsers = await User.find({
  $and: [
    { _id: { $ne: currentUserId } },
    { _id: { $nin: currentUser.friends } },
    { isOnboarded: true },
  ],
});

  res.status(200).json(recommendedUsers);
} catch (error) {
  console.error("Error in getRecommendedUsers controller", error.message);
  res.status(500).json({mesage: "Internal Server Error"});
}

}

export async function getMyFriends(req,res){
 
  try {
    const user = await User.findById(req.user.id)
      .select("friends")
      .populate("friends","fullName profilePic nativeLanguage learningLanguage");
      res.status(200).json(user.friends);
  } catch (error) {
    console.error("Error in getMyFriends controller",error.message);
    res.status(500).json({ message: "Internal Server Error"});
  }

}

export async function sendFriendRequest(req, res){
  try {

    const myId = req.user.id;
    const { id:recipientId } = req.params;

    // prevent sending req to yourself
    if(myId === recipientId){
      return res.status(400).json({message: "You can't send friend request to yourself"});
    }

    const recipient = await User.findById(recipientId);
    if(!recipient){
      return res.status(404).json({ message: "Recipient not found"});
    }

    if(recipient.friends.includes(myId)) {
      return res.status(400).json({ message: "You are already friends with this user."}); 
    }

    //check if a req already exists
    const existingRequest = await FriendRequest.findOne({
      $or:[
         { sender: myId, recipent: recipientId},
         { sender: recipientId, recipientId:myId} 
      ],
    });


    if(existingRequest){
      return res
        .status(400)
        .json({ mesage:"A friend request already exists between you and user"});
    }

    const friendRequest = await FriendRequest.create({
      sender: myId,
      recipient:recipientId
    })

    res.status(201).json(friendRequest)
    
  } catch (error) {
    console.error("Error in sendFriendRequest controller",error.message);
    res.status(500).json({ message:"Internal Server Error"});
  }
}

export async function acceptFriendRequest(req,res){
  try {

    const {id:requestId} = req.params
    const friendRequest = await FriendRequest.findById(requestId);

    if(!friendRequest){
      return res.status(404).json({ message: "Friend request not found"});
    }

    if(friendRequest.recipient.toString() !== req.user.id){
       return res.status(403).json({ message: "You are not authorized to accept this request"});
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    //add each user to the other's friends array
    if(friendRequest.status === "accepted"){
      await User.findByIdAndUpdate(friendRequest.sender,{
        $addToSet:{friends: friendRequest.recipient}
    });

    await User.findByIdAndUpdate(friendRequest.recipient,{
        $addToSet:{friends: friendRequest.sender}
    });
    }
    
    res.status(200).json({ message: "Friend request accepted"});

  } catch (error) {
    console.log("Error in acceptFriendRequest controller",error.mesage);
    res.status(500).json({ message: "Internal Server Error"}); 
  }
}

export async function removeFriendRequest(req, res) {
  try {
    const myId = req.user.id;               // Current logged-in user (recipient)
    const { userId } = req.params;          // The user who sent the friend request

    // Find the friend request where sender is userId and recipient is current user
    const friendRequest = await FriendRequest.findOne({
      sender: userId,
      recipient: myId,
      status: "pending",
    });

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    // Delete the friend request
    await FriendRequest.findByIdAndDelete(friendRequest._id);

    res.status(200).json({ message: "Friend request removed successfully" });
  } catch (error) {
    console.error("Error in removeFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}


export async function getFriendRequests(req, res) {
  try {
    const incomingReqs = await FriendRequest.find({
      recipient: req.user.id,
      status: "pending",
    }).populate("sender", "fullName profilePic nativeLanguage learningLanguage");

    const acceptedReqs = await FriendRequest.find({
      sender: req.user.id,
      status: "accepted",
    }).populate("recipient", "fullName profilePic");

    res.status(200).json({ incomingReqs, acceptedReqs });
  } catch (error) {
    console.log("Error in getPendingFriendRequests controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}


export async function getOutgoingFriendReqs(req,res){

  try {
    const outgoingRequests = await FriendRequest.find({
      sender:req.user.id,
      status: "pending",
    }).populate("recipient","fullName profilePic nativeLanguage learningLanguage");
    res.status(200).json(outgoingRequests);
  } catch (error) {
    console.log("Error in getOutgoingFriendReqs controller",error.message);
    res.status(500).json({message: "Internal Server Error"});
  }
  
}

export async function removeFriend(req, res) {
  try {
    const myId = req.user.id; // from cookie/session
    const { friendId } = req.params; // the friend to remove

    // Check if the friend exists
    const friend = await User.findById(friendId);
    if (!friend) {
      return res.status(404).json({ message: "Friend not found" });
    }

    // Remove each other from the friends list
    await User.findByIdAndUpdate(myId, {
      $pull: { friends: friendId },
    });

    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: myId },
    });

    res.status(200).json({ message: "Friend removed successfully" });

  } catch (error) {
    console.error("Error in removeFriend controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}



