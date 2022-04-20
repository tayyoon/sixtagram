require("dotenv").config();
const express = require("express");
const http = require("http");
const server = http.createServer(app);
const connect = require("./schemas");
const cors = require("cors");
const app = express();
const socketio = require("socket.io");
const { Server } = require("socket.io"); // ??????????????
const port = 3000;

connect();

app.use(cors());

// server 생성(generate a server)
const io = new Server(server, {
  // express 서버와 socket.io 연동
  cors: {
    origin: "http://3.34.132.47", // 연동된 socket.io 서버에 돌릴 주소 혹은 서버
    methods: ["GET", "POST"],
  },
});
io.on("connection", (socket) => {
  // 특정한 이벤트(리덕스의 type과 비슷한 개념)을 admit, detect, listen하여 구동한다.
  console.log(`User Connected: ${socket.id}`); // 유저가 socket 서버에 접속할 때마다 특별한 id가 부여된다.
  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });

  socket.on("send_message", (data) => {
    socket.to(data.socketId).emit("receive_message", data); // 송신자에게 받은 메시지를 다시 보낸다. '.to(data.room)' 은 같은 채팅방에 있는 사람에게 메시지 보내기
  });
  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

// router
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

// app.listen(port, () => {
//   console.log(port, "포트로 서버가 켜졌어요!");
// });

server.listen(port, () => {
  console.log("SERVER RUNNING");
  console.log(port, "포트로 서버가 켜졌어요!");
});
