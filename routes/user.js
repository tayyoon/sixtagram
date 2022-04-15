const express = require("express");
const User = require("../schemas/user");
const router = express.Router();
const jwt = require("jsonwebtoken");
const CryptoJS = require("crypto-js");
//token key 보안처리
const fs = require("fs");
require("dotenv").config();
// const { nextTick } = require("process");

router.get("/", (req, res) => {
  res.send("this is root page");
});

// 회원가입 -> follow, follower post 질문
router.post("/signUp", async (req, res) => {
  const { userId, userName, password, passwordCheck, follow, follower } =
    req.body;
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
router.get("/isLogin", async (req, res) => {});

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
    },
    process.env.key
  );
  res.status(201).send({
    msg: "로그인 성공",
    token,
  });
});

module.exports = router;
