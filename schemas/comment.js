const mongoose = require("mongoose");

const CommentsSchema = new mongoose.Schema({});

// UserSchema.virtual('jwtId').get(function () {
//     return this._id.toHexString();
// });

// UserSchema.set('toJSON', {
//     virtuals: true,
// });

module.exports = mongoose.model("Comments", CommentsSchema);
