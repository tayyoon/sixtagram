const mongoose = require("mongoose");
const connect = () => {
  mongoose
    .connect("mongodb://3.34.132.47:27017/sixtagram", {
      ignoreUndefined: true,
    })
    .catch((err) => {
      console.error(err);
    });
};
module.exports = connect;
