const rateLimit = require("express-rate-limit");
const { logEvents } = require("./logger");

const loginLimitter = rateLimit({
  windowMs: 60 * 1000, //1 minute
  max: 5,
  message: {
    message:
      "Too many login attempts from this IP, Please try again after 60 secod pause",
  },
  handler: (req, res, next, options) => {
    logEvents(
      `To Many Requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
      "errorlog.log"
    );
    res.status(options.statusCode).send(options.message);
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = loginLimitter;
