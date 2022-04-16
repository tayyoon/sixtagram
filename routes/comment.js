const express = require("express");
const Comments = require("../schemas/comment");
const router = express.Router();
const jwt = require("jsonwebtoken");
//token key 보안처리
const fs = require("fs"); //?
const authMiddleware = require("../middlewares/auth-middleware");
const mykey = fs.readFileSync(__dirname + "/../middlewares/key.txt").toString();
//multer-s3 미들웨어 연결
// require('dotenv').config();
// const upload = require('../S3/s3');


//댓글작성
router.post("/comments/:postId", authMiddleware, async (req, res) => {
  console.log(req); 
const {comment, postId} = req.params 

const { user } = res.locals; // 토큰 뽑아쓰고 

const moment = require('moment'); 
require('moment-timezone'); 
moment.tz.setDefault("Asia/Seoul"); 
const createdAt = String(moment().format('YYYY-MM-DD HH:mm:ss')); //

const userId = user.userId;
const createComment = await Comments.create({
  comment, createdAt, postId, userId
});

res.status(200).send({msg: 'success', createComment});
});


// 댓글조회 --> 댓글을 작성한거를 조회한다. 어떤댓글을 조회하는걸까? ---> 이포스트에 달라 --> 그 아이디에 해당하는 코멘트를 주겠당.
router.get("/comments/:postId", async(req, res) => {
  try {
    console.log("------->2",req); // :postId = {postId} 
    const postId = req.params.postId 
    // console.log(postId);
    console.log("-------->",postId); // postId값이 나오겠지? 안찍혔으면
    const commentsList = await Comments.find({postId}); // commentList 코멘트목록을 가져옴
    
    res.status(200).json({
      commentsList,result:true
    });
  } catch (error) {
    res.status(400).json({
      result:false
    })
  }
});


//댓글삭제  --> 게시글들어가 --> 댓글조회에서 댓글을 작성한사람만이 댓글을 지울수있게? commentId는 내가 선택한걸 지워야되니까. 이 댓글을 쓴사람을 찾아야된다.
router.delete("/comments/:commentId", authMiddleware,async(req, res) => {
  // console.log(req);
  const commentId = req.params.commentId;
  // console.log(commentId);

  const selectComment = await Comments.findOne({ _id : commentId }); // 내가 디비보고 바꿈. find나 findone을 둘중 아무거나 해도되는게 어차피 commentid는 유니크한값이니까. 
  console.log("sdasdasdsad",selectComment);
  // 하나밖에 안나와 그래서 둘중에 아무거나 써도됨 
  // selectComment.userId   내가 선택한 댓글의 작성한사람의 유저아이디.

  const { user } = res.locals; // 로그인한 사람의 유저아이디를 가져와야함 
  console.log("asdasd",user);
  // user.userId;  로그인한사람이라고 생각 

  if( selectComment.userId === user.userId){
   await Comments.deleteOne({ _id : commentId  })
   res.status(200).json({
     result:true
   })
  } else {
      res.status(400).json({
        result:false
      })
  }
});

module.exports = router;
