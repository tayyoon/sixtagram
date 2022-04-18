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

// router.get("/postList", authMiddleware, async (req, res, next) => {
//   const { user } = res.locals;
//   const { idList } = req.body;

//   //console.log(idList)
//   const followPost = [];

//   try {
//     for (i = 0; i < idList.length; i++) {
//       let followId = idList[i];
//       //console.log(followId)  //ok //
//       const postList = await Post.find({ userId: followId });
//       for (j = 0; j < postList.length; j++) {
//         followPost.push(postList[j]);
//       }
//     }
//     followPost.sort(followPost.createdAt).reverse();
//     console.log(followPost);
//     // friendsinfo.sort(friendsinfo.createdAt);
//     // console.log("aa",friendsinfo)
//     return res.json({ followPost });
//   } catch (err) {
//     res.status(400).json({ msg: "게시글이 조회되지 않았습니다." });
//     next(err);
//   }
// });

// // {"idList":["test02","test04"]}

// //게시글 작성
// router.post(
//   "/posts",
//   authMiddleware,
//   upload.single("imageUrl"),
//   async (req, res) => {
//     //작성한 정보 가져옴
//     const { content } = req.body;
//     const imageUrl = req.file.location;
//     //console.log("req.file: ", req.file); // 테스트 => req.file.location에 이미지 링크(s3-server)가 담겨있음
//     console.log(content, imageUrl);
//     // 사용자 브라우저에서 보낸 쿠키를 인증미들웨어통해 user변수 생성
//     const { user } = res.locals;
//     const userId = user.userId;
//     // console.log(user)  //ok
//     // 글작성시각 생성
//     require("moment-timezone");
//     moment.tz.setDefault("Asia/Seoul");
//     const createdAt = String(moment().format("YYYY-MM-DD HH:mm:ss"));
//     try {
//       const postList = await Post.create({
//         imageUrl,
//         createdAt,
//         content,
//         userId,
//       });
//       res.send({ result: "success", postList });
//     } catch {
//       res.status(400).send({ msg: "게시글이 작성되지 않았습니다." });
//     }
//   }
// );

// // 게시글 수정 페이지
// router.patch(
//   "/posts/:postId",
//   upload.single("imageUrl"),
//   authMiddleware,
//   async (req, res) => {
//     const { postId } = req.params;
//     const { content } = req.body;
//     const imageUrl = req.file.location;
//     //console.log(userId) //ok
//     //게시글 내용이 없으면 저장되지 않고 alert 뜨게하기.
//     if (!content.length) {
//       res.status(401).send({ msg: "게시글 내용을 입력해주세요." });
//       return;
//     }
//     try {
//       const video = await Post.find({ _id: postId }); // 현재 URL에 전달된 id값을 받아서 db찾음
//       const url = video[0].imageUrl.split("/"); // video에 저장된 fileUrl을 가져옴
//       const delFileName = url[url.length - 1];
//       s3.deleteObject(
//         {
//           Bucket: "sixtagram",
//           Key: delFileName,
//         },
//         (err, data) => {
//           if (err) {
//             throw err;
//           }
//         }
//       );
//       await Post.updateOne({ _id: postId }, { $set: { content, imageUrl } });
//       const postList = await Post.findOne({ _id: postId });
//       res.send({ result: "success", postList });
//     } catch {
//       res.status(400).send({ msg: "게시글이 수정되지 않았습니다." });
//     }
//   }
// );

// // 게시글 삭제
// router.delete("/posts/:postId", authMiddleware, async (req, res) => {
//   const { postId } = req.params;
//   const video = await Post.find({ _id: postId }); // 현재 URL에 전달된 id값을 받아서 db찾음
//   //console.log(postId)
//   const url = video[0].imageUrl.split("/"); // video에 저장된 fileUrl을 가져옴
//   const delFileName = url[url.length - 1];
//   try {
//     await Post.deleteOne({ _id: postId });
//     s3.deleteObject(
//       {
//         Bucket: "sixtagram",
//         Key: delFileName,
//       },
//       (err, data) => {
//         if (err) {
//           throw err;
//         }
//       }
//     );
//     res.send({ result: "success" });
//   } catch {
//     res.status(400).send({ msg: "게시글이 삭제되지 않았습니다." });
//   }
// });

module.exports = router;
