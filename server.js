require("dotenv").config();
require("express-async-errors");
const app = require("./app");
const connectDb = require("./config/dbConn");
const mongoose = require("mongoose");
const { logEvents } = require("./middleware/logger");
const PORT = process.env.PORT || 3500;

connectDb();

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDb");
  app.listen(PORT, () => console.log(`server running on port ${PORT}`));
});

mongoose.connection.on("error", (err) => {
  console.log(err);
  logEvents(
    `${err.no} : ${err.code}\t${err.syscall}\t${err.hostname}`,
    "mongoErrorLog.log"
  );
});
