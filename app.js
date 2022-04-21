require("dotenv").config();
const express = require("express");
const connect = require("./schemas");
const cors = require("cors");
const app = express();
const port = 5000;

connect();

app.use(cors());

const postsRouter = require("./routes/post");
const usersRouter = require("./routes/user");
const commentsRouter = require("./routes/comment");
const req = require("express/lib/request");
const likesRouter = require("./routes/like");

const requestMiddleware = (req, res, next) => {
  console.log("Request URL:", req.originalUrl, " - ", new Date());
  next();
};
app.use(express.static("static"));
//프론트에서 오는 데이터들을 body에 넣어주는 역할
app.use(express.json());
app.use(requestMiddleware);
//multer 저장파일 조회
app.use("/profile", express.static("uploads"));

//form 형식으로 데이터를 받아오고 싶을 때(false->true)
app.use("/api", express.urlencoded({ extended: false }), postsRouter);
app.use("/api", express.urlencoded({ extended: true }), usersRouter);
app.use("/api", express.urlencoded({ extended: false }), commentsRouter);
app.use("/api", express.urlencoded({ extended: false }), likesRouter);

// app.get('/', (req, res) => {
//     res.sendFile(__dirname + '/static/index.html');
// });

//CORS 테스트 (https://test-cors.org)
//origin: 'http://google.com', 구글에서만 데이터를 처리하는 것. 이래야 해커의 위협에서 보호가능
//origin: '*', 어떤 곳에서든 데이터를 처리할 수 있게함.
// app.use(cors({
//     orgin: '*',
// }));

app.listen(port, () => {
  console.log(port, "포트로 서버가 켜졌어요!");
});
