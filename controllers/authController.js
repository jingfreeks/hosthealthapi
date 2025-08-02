const User = require("../models/Users");
const Profile = require("../models/Profile");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getAuth, signInWithEmailAndPassword } = require("../config/firebase");
const auth = getAuth();

// @desc Firebase Login
// @route POST /auth/flogin
// @access Private
const fLogin = async (req, res) => {
  const { email, password } = req.body;
  const usrResponse = await signInWithEmailAndPassword(auth, email, password);
  const founUser = await User.findOne({ email }).exec();
  if (!founUser || !founUser.active) {
    return res.status(401).json({ message: "User not found" });
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
    { expiresIn: process.env.NODE_ENV === 'production' ? "10m" : "1h" }
  );
  const refreshToken = jwt.sign(
    {
      username: founUser.username,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "1d" }
  );
  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? "None" : "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({ accessToken, userId: founUser._id });
};

// @desc Login
// @route POST /auth
// @access Private
const login = async (req, res) => {
  const { username, password } = req.body;
  console.log(username, password);
  if (!username || !password) {
    return res.status(400).json({ message: "All fields are required", error: true });
  }
  const founUser = await User.findOne({ username }).exec();

  if (!founUser || !founUser.active) {
    return res.status(401).json({ message: "Username not found" });
  }
  const match = await bcrypt.compare(password, founUser.password);
  if (!match) return res.status(401).json({ message: "Invalid Password" });
  const accessToken = jwt.sign(
    {
      UserInfo: {
        username: founUser.username,
        roles: founUser.roles,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.NODE_ENV === 'production' ? "15m" : "1h" }
  );
  const refreshToken = jwt.sign(
    {
      username: founUser.username,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "1d" }
  );
  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? "None" : "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  const usrProfile = await Profile.findOne({ userId: founUser._id }).lean();
  res.json({
    accessToken,
    refreshToken,
    userId: founUser._id,
    roles: founUser.roles,
    isOnBoarding: !!usrProfile,
  });
};

// @desc Refresh token
// @route GET /auth/refresh
// @access Public
const refresh = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.status(401).json({ message: "Unauthorized" });
  const refreshToken = cookies.jwt;
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Forbidden", error: true });
      const foundUser = await User.findOne({ username: decoded.username }).exec();
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
// @access Public
const logout = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204);
  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  res.json({ message: "Cookie cleared" });
};

module.exports = {
  login,
  refresh,
  logout,
  fLogin,
};
