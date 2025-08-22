const Message = require("../models/message.model");
const cloudinary = require("../lib/cloudinary");
const User = require("../models/user.model");
const { getRecieverSocketId, io } = require("../lib/socket");

const getUsersForSidebar = async (req, res) => {
  try {
    // Find all users except the logged-in one
    const users = await User.find({ _id: { $ne: req.user._id } });

    res.json(users);
  } catch (err) {
    console.error("Error fetching sidebar users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      //upload to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();
    // realtime functionality : socket.io

    const recieverSocketId = getRecieverSocketId(receiverId);
    if (recieverSocketId) {
      //if user is online
      io.to(recieverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getUsersForSidebar, sendMessage, getMessages };
