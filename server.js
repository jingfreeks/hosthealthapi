require("dotenv").config();
require("express-async-errors");
const express = require("express");
const app = express();
const path = require("path");



// const fadmin=require("firebase-admin")
// const credentials=require("./serviceAccountKey.json")

// fadmin.initializeApp({
//   credential:fadmin.credential.cert(credentials)
// })

const { logger } = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const connectDb = require("./config/dbConn");
const mongoose = require("mongoose");
const { logEvents } = require("./middleware/logger");
const PORT = process.env.PORT || 3500;

connectDb();
app.use(logger);
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use("/", express.static("public"));

app.use("/", require("./routes/root"));
app.use("/auth", require("./routes/authRoutes"));
app.use("/users", require("./routes/userRoutes"));
app.use("/signup", require("./routes/signupRoutes"));
app.use("/fsignup", require("./routes/firebaseSignupRoutes"));
app.use("/notes", require("./routes/notesRoutes"));
app.use("/states", require("./routes/stateRoutes"));
app.use("/city", require("./routes/cityRoutes"));
app.use("/dept", require("./routes/deptRoutes"));
app.use("/company", require("./routes/companyRoutes"));
app.use("/shift", require("./routes/shiftRoutes"));
app.use("/jobs", require("./routes/jobsRoutes"));
app.use("/profile", require("./routes/profileRoutes"));
app.use("/bank", require("./routes/bankRoutes"));
app.use("/product", require("./routes/productRoutes"));

app.all("*", (req, res) => {
  res.status(404);

  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts(json)) {
    res.json({ message: "404 not found" });
  } else {
    res.type("txt").send("404 not found");
  }
});

app.use(errorHandler);
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
