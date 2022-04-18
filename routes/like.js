const express = require("express");
const Post = require("../schemas/post");
const Like = require("../schemas/like");
const User = require("../schemas/user");
const router = express.Router();
const jwt = require("jsonwebtoken");
const moment = require("moment");
require("dotenv").config();
const authMiddleware = require("../middlewares/auth-middleware");

// 좋아요
router.put("/like", authMiddleware, async (req, res) => {
  const { postId } = req.body;
  const { user } = res.locals;
  const { userId } = user;

  const existBoard = await Post.find({ _id: postId });
  console.log(existBoard);
  let like = existBoard[0]["likes"];
  console.log(like);

  await Post.updateOne({ _id: postId }, { $set: { likes: like + 1 } });
  await Like.create({ userId, postId });

  res.send("좋아요 성공!");
});

// 아니좋아요~
router.delete("/unlike", authMiddleware, async (req, res) => {
  const { user } = res.locals;
  const { userId } = user;
  const { postId } = req.body;

  const existBoard = await Post.find({ _id: postId });
  // console.log(existBoard)
  let like = existBoard[0]["likes"];
  // console.log(like)

  await Post.updateOne({ _id: postId }, { $set: { likes: like - 1 } });
  await Like.findOneAndDelete({ userId: userId, postId: postId }, { userId });

  res.send("아니좋아요~~");
});

module.exports = router;
