const mongoose = require("mongoose");

const ChatsSchema = new Schema({
  userId: {
    type: String,
  },
  message: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Chat", ChatsSchema);
