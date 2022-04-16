const express = require("express");
const Post = require("../schemas/post");
const router = express.Router();
const jwt = require("jsonwebtoken");
const moment = require("moment");
//token key 보안처리
const fs = require("fs");
// const mykey = fs.readFileSync(__dirname + “/../middlewares/key.txt”).toString();
//multer-s3 미들웨어 연결
require("dotenv").config();
//const upload = require(“../S3/s3”);
const authMiddleware = require("../middlewares/auth-middleware");


// const path = require("path");
// let AWS = require("aws-sdk");
// AWS.config.loadFromPath(path.join(__dirname, "../config/s3.json")); // 인증
// let s3 = new AWS.S3();


// let multer = require("multer");
// let multerS3 = require('multer-s3');
// let upload = multer({
   
//     storage: multerS3({
//         s3: s3,
//         bucket: "sparta-bucket-jw",
//         key: function (req, file, cb) {
//              let extension = path.extname(file.originalname);
//              cb(null, Date.now().toString() + extension)
//         },
//         acl: 'public-read-write',
//     })
// })


//  //상세조회 페이지 
//  router.get("/blogList/:PostId", async (req, res) => {
//   //주소에 PostId를 파라미터값으로 가져옴
//   const { PostId }  = req.params;
//   //console.log(PostId); //ok 

//   blogList = await Blog.findOne({PostId});
//   //detail 값으로 넘겨줌
//   res.json({ blogList });
// });



// 게시글 조회 //follow 리스트 있는 id만 보이게 하기 
router.get("/postList", authMiddleware, async (req, res, next) => {

  try {
    const postList = await Post.find({}).sort("-createdAt");
    res.json({ postList });
  } catch (err) {
    res.status(400).send({msg :"게시글이 조회되지 않았습니다."});
    next(err);
  } 
}); 



//게시글 작성
router.post("/posts", authMiddleware, async (req, res) => {
  //작성한 정보 가져옴
  const { content } = req.body;
  //console.log(content); // ok

  // 사용자 브라우저에서 보낸 쿠키를 인증미들웨어통해 user변수 생성
  const { user } = res.locals;
  const userId = user.userId;
  //console.log(user)  //ok

  // 글작성시각 생성 
  require("moment-timezone");
  moment.tz.setDefault("Asia/Seoul");
  const createdAt = String(moment().format("YYYY-MM-DD HH:mm:ss"));

  try{
    const postList = await Post.create({ createdAt, content, userId });
    res.send({ result: "success", postList });
  }catch{
    res.status(400).send({msg :"게시글이 작성되지 않았습니다."});
  }
});



// 게시글 수정 페이지
router.patch("/posts/:postId", authMiddleware, async (req, res) => {
 
  const { postId } = req.params;
  const { content } = req.body;
  //console.log(userId) //ok 

  //게시글 내용이 없으면 저장되지 않고 alert 뜨게하기. 
   if (!content.length) {
    res.status(401).send({msg : "게시글 내용을 입력해주세요."});  
    return;
  }

  try{
    await Post.updateOne({ _id : postId }, { $set: { content } });
    const postList = await Post.findOne({ _id : postId })
    res.send({ result: "success", postList });
  }catch{
    res.status(400).send({msg :"게시글이 수정되지 않았습니다."});
  }
})



// 게시글 삭제 
router.delete("/posts/:postId", authMiddleware, async (req, res) => {
  const { postId } = req.params;
  //console.log(postId)

  try{
    await Post.deleteOne({ _id : postId });
    res.send({ result: "success" });
  }catch{
    res.status(400).send({msg :"게시글이 삭제되지 않았습니다."});
  }
 
});




router.get("/", (req, res) => {
  res.send("this is root page");
});

module.exports = router;
