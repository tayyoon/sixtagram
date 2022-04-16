const mongoose = require("mongoose");

const CommentsSchema = new mongoose.Schema({
    // commentId: {
    //     type: String,
    //     required: true,
    //   },
      userId: {
        type: String,
      },
      postId: {
        type: String,
      },
      comment: {
        type: String,
      },
      createdAt: {
        type: String,
      },
});

CommentsSchema.virtual('commentId').get(function () {
    return this._id.toHexString();
});

CommentsSchema.set('toJSON', {
    virtuals: true,
});

module.exports = mongoose.model("Comments", CommentsSchema);
