const express = require("express");
const Post = require("../schemas/post");
const router = express.Router();
const jwt = require("jsonwebtoken");
//token key 보안처리
const fs = require("fs");
const mykey = fs.readFileSync(__dirname + "/../middlewares/key.txt").toString();
//multer-s3 미들웨어 연결
require("dotenv").config();
//const upload = require("../S3/s3");
const authMiddleware = require("../middlewares/auth-middleware");




// 게시글 목록 조회 
// router.get("/blogList", async (req, res, next) => {

//   try {
//     const blogList = await Blog.find({}).sort("-NowDate");
//     res.json({ blogList });
//   } catch (err) {
//     console.error(err);
//     next(err);
//   } 
// }); 



 //게시글조회 페이지 
 router.get("/api/postList/:PostId", async (req, res) => {
  //주소에 PostId를 파라미터값으로 가져옴
  const { PostId }  = req.params;
  //console.log(PostId); //ok 

  idList = await Post.findOne({PostId});
  //detail 값으로 넘겨줌
  res.json({ idList });
});



// 게시글 작성 페이지 //저장됌 
router.post('/api/posts', authMiddleware, async (req, res) => {
  //작성한 정보 가져옴
  const { content, imageUrl } = req.body;
  //console.log(borderDate, subject, nick, password_write, content); // ok

// 사용자 브라우저에서 보낸 쿠키를 인증미들웨어통해 user변수 생성
  const { user } = res.locals 
 //console.log(user)  //ok

  const moment = require('moment'); 
  require('moment-timezone'); 
  moment.tz.setDefault("Asia/Seoul"); 
  const createdAt = String(moment().format('YYYY-MM-DD HH:mm:ss')); 

  //현재시각을 암호화하여 PostId생성 
  const postId = CryptoJS.SHA256(createdAt)['words'][0];
  //console.log(PostId) //ok

  // 해당 게시글의 ID가 DB에 있는지 조회
  const existPostId = await Post.find({ postId });
  const userId = user.id
 // console.log(UserId) //ok

  //유효성 검사
  if (existPostId.length == 0) {
    await Post.create({ createdAt, postId, content, userId });
  }
  res.send({ result: "success" });
});




// 게시글 수정 페이지
router.patch("/blogList/:PostId", authMiddleware, async (req, res) => {
 
  const { PostId } = req.params;
  const { nick, subject, content } = req.body;
  //console.log(userId) //ok 

  //게시글 내용이 없으면 저장되지 않고 alert 뜨게하기. 
   if (!content.length) {
    res.status(401).send();  //401 : 인증실패
    return;
  }

  isBorder = await Blog.find({ PostId });
  if (isBorder.length) {
    await Blog.updateOne({ PostId }, { $set: { nick, subject, content } });
  }
  res.send({ result: "success" });
})




// 게시글 삭제 
router.delete("/blogList/:PostId", authMiddleware, async (req, res) => {
  const { PostId } = req.params;
  const isBorder = await Blog.find({ PostId });
  const {user} = res.locals;

  if (isBorder.length > 0) {
    await Blog.deleteOne({ PostId });
  }
  res.send({ result: "success" });
});






router.get("/", (req, res) => {
  res.send("this is root page");
});

module.exports = router;
