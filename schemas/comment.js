const mongoose = require("mongoose");

const CommentsSchema = new mongoose.Schema({
    comment: {
        type: String,
        required: true,
      },
      nickname: {
        type: String,
      },
      email: {
        type: String,
      },
      postId: {
        type: String,
      },
      createdAt: {
        type: String,
      },
});






// UserSchema.virtual('jwtId').get(function () {
//     return this._id.toHexString();
// });

// UserSchema.set('toJSON', {
//     virtuals: true,
// });

module.exports = mongoose.model("Comments", CommentsSchema);
