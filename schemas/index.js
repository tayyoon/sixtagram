const mongoose = require("mongoose");
const connect = () => {
  mongoose
    .connect("mongodb://13.125.254.69:27017/sixtagram", {
      ignoreUndefined: true,
    })
    .catch((err) => {
      console.error(err);
    });
};
module.exports = connect;
