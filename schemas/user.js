const mongoose = require("mongoose");

const UsersSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true,
    required: true,
  },
  userImage: {
    type: String,
  },
  hashPassword: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
  },
  follow: [String],

  follower: [String],
});

module.exports = mongoose.model("User", UsersSchema);
