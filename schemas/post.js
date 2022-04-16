const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
    },
    userId: {
        type: String,
    },
    createdAt: {
        type: String,
    },
});

PostSchema.virtual('PostId').get(function () {
    return this._id.toHexString();
});
PostSchema.set('toJSON', {
    virtuals: true,
});

module.exports = mongoose.model("Posts", PostSchema);
