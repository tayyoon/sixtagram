const express = require("express");
const User = require("../schemas/user");
const Likes = require("../schemas/like");
const router = express.Router();
const jwt = require("jsonwebtoken");
const CryptoJS = require("crypto-js");
//token key 보안처리
const fs = require("fs");
const authMiddleware = require("../middlewares/auth-middleware");
require("dotenv").config();

router.get("/", (req, res) => {
  res.send("this is root page");
});

// 회원가입 -> follow, follower post 질문
router.post("/signUp", async (req, res) => {
  const {
    userId,
    userName,
    password,
    passwordCheck,
    userImage,
    follow,
    follower,
  } = req.body;
  try {
    const checkIdLen = /^.{4,10}$/;
    const checkPwLen = /^.{4,15}$/;

    if (!checkIdLen.test(userId)) {
      return res.status(403).send("아이디는 4-10 자리 입니다.");
    } else if (!checkPwLen.test(password)) {
      return res.status(403).send("비밀번호는 4-15 자리 입니다.");
    } else if (password != passwordCheck) {
      return res.status(403).send("비밀번호가 일치하지 않습니다.");
    }

    const hashPassword = CryptoJS.AES.encrypt(
      password,
      process.env.keyDecrypt
    ).toString();

    const user = await User.create({
      userId,
      userName,
      hashPassword,
      userImage,
      // follow,
      // follower,
    });
    await User.updateOne(
      { userId },
      {
        $push: { follow: follow },
      }
    );
    await User.updateOne(
      { userId },
      {
        $push: { follower: follower },
      }
    );

    console.log(userId);

    res.status(201).send({
      msg: "회원가입 성공",
      user,
    });
  } catch (err) {
    console.log("sdsdfdfs", err);
    res.status(403).send("아이디 중복체크 해주세요.");
    return;
  }
});

// 아이디중복
router.post("/idCheck", async (req, res) => {
  try {
    const regId = /^[A-Za-z0-9]{4,10}$/;
    const { userId } = req.body;
    const idCheck = await User.findOne({ userId });

    if (!regId.test(userId)) {
      return res
        .status(403)
        .send({ errorMessage: "아이디는 알파벳, 숫자만 사용가능합니다." });
    } else if (idCheck) {
      return res.status(403).send("이미 사용중인 아이디 입니다.");
    }
    res.status(201).send("사용할 수 있는 아이디 입니다.");
  } catch (err) {
    console.error(err);
    return;
  }
});

// 로그인유지
router.get("/isLogin", authMiddleware, async (req, res) => {
  const { user } = res.locals;
  const { userId, userName, follow, follower } = user;

  const likePost = await Likes.find({ userId });
  console.log(likePost.length);
  const likePosts = [];
  for (let i = 0; i < likePost.length; i++) {
    likePosts.push(likePost[i].postId);
  }

  console.log(likePosts);
  const userInfo = { userId, userName, follow, follower, userImage };
  res.status(203).send({ msg: "good", userInfo, likePosts });
});

// 로그인
router.post("/login", async (req, res) => {
  const { userId, password } = req.body;

  const user = await User.findOne({ userId: userId });
  console.log(user);

  if (!user) {
    res.status(403).send({ errorMessage: "아이디를 확인 해 주세요." });
    return;
  }

  const existPw = user.hashPassword;
  console.log(existPw);
  const decryptedPsw = CryptoJS.AES.decrypt(existPw, process.env.keyDecrypt);
  console.log("1111111111111");
  const originPw = decryptedPsw.toString(CryptoJS.enc.Utf8);

  if (originPw != password) {
    res.status(400).send({ errorMessage: "비밀번호를 확인해 주세요." });
    return;
  }

  const userInfo = await User.findOne({ userId });
  const token = jwt.sign(
    {
      userId: userInfo.userId,
      userName: userInfo.userName,
      follow: userInfo.follow,
      follower: userInfo.follower,
      userImage: userInfo.userImage,
    },
    process.env.key
  );
  res.status(201).send({
    msg: "로그인 성공",
    token,
  });
});

// 팔로우
router.post("/follow", authMiddleware, async (req, res) => {
  const { user } = res.locals;
  const { userId } = user;
  const { followUser } = req.body;

  const followCheck = await User.find({ userId });
  console.log("aaaaaaa", followCheck);
  const followList = followCheck[0].follow;
  console.log("팔로우 리스트-------->", followList);
  if (!followList.length) {
    await User.updateOne({ userId }, { $push: { follow: followUser } });
    await User.updateOne(
      { userId: followUser },
      { $push: { follower: userId } }
    );
  } else {
    for (let i = 0; i < followList.length; i++) {
      if (followList[i] != followUser) {
        await User.updateOne({ userId }, { $push: { follow: followUser } });
        await User.updateOne(
          { userId: followUser },
          { $push: { follower: userId } }
        );
      } else {
        res.status(401).send({ errorMessage: "이미 팔로우 되어있습니다!" });
        return;
      }
    }
  }

  res.status(203).send({ msg: "ㅊㅋㅊㅋ" });
});

// aws s3연결
const path = require("path");
let AWS = require("aws-sdk");
AWS.config.loadFromPath(path.join(__dirname, "../config/s3.json")); // 인증
let s3 = new AWS.S3();
let multer = require("multer");
let multerS3 = require("multer-s3");
let upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "sixtagram",
    key: function (req, file, cb) {
      let extension = path.extname(file.originalname);
      cb(null, Date.now().toString() + extension);
    },
    acl: "public-read-write",
  }),
});

// 유저 프로필 업로드
router.post(
  "/userEdit",
  upload.single("profile"),
  authMiddleware,
  async (req, res) => {
    const { user } = res.locals;
    const { userId } = user;
    const profile = req.file?.location;

    try {
      const userInfo = await User.find({ userId });
      console.log(userInfo);
      const userImg = userInfo[0].userImage;
      console.log(userImg);

      if (userImg) {
        // console.log("new이미지====", imageUrl);
        const url = userImg.split("/");
        const delFileName = url[url.length - 1];
        s3.deleteObject(
          {
            Bucket: "sixtagram",
            Key: delFileName,
          },
          (err, data) => {
            if (err) {
              throw err;
            }
          }
        );
        await User.updateOne({ userId }, { $set: { userImage: profile } });
      } else if (userImg == 1) {
        await User.updateOne({ userId }, { $set: { userImage: profile } });
      }
      res.send("성공");
    } catch (error) {
      res.status(400).send({ msg: "프로필이 수정되지 않았습니다." });
    }
  }
);

// 언팔로우
router.post("/unfollow", authMiddleware, async (req, res) => {
  const { user } = res.locals;
  const { userId } = user;
  const { unFollowUser } = req.body;

  const followCheck = await User.find({ userId });
  const followList = followCheck[0].follow;
  console.log(followList[0], followList[1]);

  try {
    for (let i = 0; i < followList.length; i++) {
      if (unFollowUser == followList[i]) {
        console.log("aaa", followList[i]);
        await User.updateOne({ userId }, { $pull: { follow: unFollowUser } });
        await User.updateOne(
          { userId: unFollowUser },
          { $pull: { follower: userId } }
        );
      }
    }
  } catch (error) {
    res.status(401).send({ msg: "팔로우한 사용자가 아닙니다." });
    return;
  }
  res.status(203).send({ msg: "언팔로우 되었습니다." });
});

router.get("/recommand", authMiddleware, async (req, res) => {
  const userAll = await User.find({});

  console.log("유저 뽑아 유저", userAll);

  function getFields(input, field) {
    var output = [];
    for (var i = 0; i < input.length; ++i) output.push(input[i][field]);
    return output;
  }

  let result = getFields(userAll, "userId");

  const userRandom = [...new Set(result)]
    .sort(() => 0.5 - Math.random())
    .slice(0, 5);

  res.send({ msg: "랜덤뽑기 성공", userRandom });
});

module.exports = router;
