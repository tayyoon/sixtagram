const mongoose = require("mongoose");

const UsersSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true,
    required: true,
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

// UserSchema.virtual('jwtId').get(function () {
//     return this._id.toHexString();
// });

// UserSchema.set('toJSON', {
//     virtuals: true,
// });

module.exports = mongoose.model("User", UsersSchema);
