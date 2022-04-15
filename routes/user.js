const express = require("express");
const User = require("../schemas/user");
const router = express.Router();
const jwt = require("jsonwebtoken");
//token key 보안처리
const fs = require("fs");
const mykey = fs.readFileSync(__dirname + "/../middlewares/key.txt").toString();
//multer-s3 미들웨어 연결
require("dotenv").config();
const upload = require("../S3/s3");

router.get("/", (req, res) => {
  res.send("this is root page");
});

module.exports = router;
