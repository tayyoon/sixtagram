const jwt = require("jsonwebtoken");
const User = require("../schemas/user");
const fs = require("fs");
require("dotenv").config();
// const mykey = fs.readFileSync(__dirname + "/key.txt").toString();

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    res.status(401).send({
      errorMEssage: "로그인 후 사용하세요",
    });
    return;
  }
  const [tokenType, tokenValue] = authorization.split(" ");

  if (tokenType !== "Bearer") {
    res.status(401).send({
      errorMessage: "로그인 후 사용하세요!",
    });
    return;
  }

  //jwt검증//
  try {
    const { userId } = jwt.verify(tokenValue, process.env.key);
    //검증 성공시 locals에 인증 정보 넣어주기//
    User.findOne({ userId })
      .exec()
      .then((user) => {
        res.locals.user = user;
        next();
      });
  } catch (error) {
    res.status(401).send({
      errorMEssage: "로그인 하시고 사용하세요",
    });
    return;
  }
};
