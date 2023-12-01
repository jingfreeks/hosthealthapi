const User = require("../models/Users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// @desc Login
// @route POST /auth/login
// @access Private

const login = async (req, res) => {
  const { username, password } = req.body;
  console.log("username", username);
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "All fields are required", error: true });
  }

  const founUser = await User.findOne({ username }).exec();
  if (!founUser || !founUser.active) {
    return res.status(401).json({ message: "Username not found" });
  }

  const match = await bcrypt.compare(password, founUser.password);
  if (!match) return res.status(401).json({ message: "Unauthorized" });

  const accessToken = jwt.sign(
    {
      UserInfo: {
        username: founUser.username,
        roles: founUser.roles,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "10m" }
  );

  const refreshToken = jwt.sign(
    {
      username: founUser.username,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "1d",
    }
  );

  // create secure cookie with refresh token
  res.cookie("jwt", refreshToken, {
    httpOnly: true, //accessable only by web server
    secure: true, // https
    sameSite: "None", //cross-site cookie
    maxAge: 7 * 24 * 60 * 60 * 1000, // cookie expiry : set to match rT
  });
  res.json({ accessToken,userId:founUser._id });
};

// @desc Refresh
// @route GET /auth/refresh
// @access Public - because access token expired
const refresh = (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) return res.status(401).json({ message: "Unauthorized" });

  const refreshToken = cookies.jwt;

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err)
        return res.status(403).json({ message: "Forbidden", error: true });

      const foundUser = await User.findOne({
        username: decoded.username,
      }).exec();
      if (!foundUser) return res.status(401).json({ message: "Unauthorized" });

      const accessToken = jwt.sign(
        {
          UserInfo: {
            username: foundUser.username,
            roles: foundUser.roles,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );

      res.json({ accessToken });
    }
  );
};

// @desc Logout
// @route POST /auth/logout
// @access Public - just to clear the cookie if exist
const logout = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); // no content
  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  res.json({ message: "Cookie cleared" });
};

module.exports = {
  login,
  refresh,
  logout,
};
