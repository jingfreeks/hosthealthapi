const User = require("../models/Users");
const Note = require("../models/Notes");
const bcryp = require("bcrypt");
const {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
} = require("../config/firebase");
const auth = getAuth();

//get all users
// get
const getAllUsers = async (req, res) => {
  const users = await User.find().select("-password").lean();
  if (!users?.length) {
    return res.status(400).json({ message: "No users Found", error: true });
  }
  res.json(users);
};

//create firebase new user
//post
const createFNewUser = async (req, res) => {
  const { email, password,roles } = req.body;

  const duplicate = await User.findOne({ email }).lean().exec();
  if (duplicate) {
    return res.status(409).json({ message: "Duplicate Email address" });
  }
  await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  const hashedPwd = await bcryp.hash(password, 10); //salt round
  const userObject =
  !Array.isArray(roles) || !roles.length
    ? { email, password: hashedPwd }
    : { email, password: hashedPwd, roles };
//create user and store a new user

const user = await User.create(userObject);
  if (user) {
    res.status(201).json({ message: `New email ${email} created` });
  } else {
    res.status(400).json({ message: "Invalid user data received" });
  }
};
//create new user
//post
const createNewUser = async (req, res) => {
  const { username, password, roles } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "All fields are required", error: true });
  }

  //check for duplicate
  const duplicate = await User.findOne({ username }).lean().exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate Username" });
  }

  //has password

  const hashedPwd = await bcryp.hash(password, 10); //salt round

  const userObject =
    !Array.isArray(roles) || !roles.length
      ? { username, password: hashedPwd }
      : { username, password: hashedPwd, roles };
  //create user and store a new user

  const user = await User.create(userObject);

  if (user) {
    res.status(201).json({ message: `New user ${username} created` });
  } else {
    res.status(400).json({ message: "Invalid user data received" });
  }
};
//update a user
//patch
const updateUser = async (req, res) => {
  const { id, username, roles, active, password,email } = req.body;

  if (
    !id ||
    !username ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== "boolean"
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    res.status(400).json({ message: "User not found" });
  }

  //check for duplicate

  const duplicate = await User.findOne({ username })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  // Allow update to the original user

  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate Username" });
  }

  user.username = username;
  user.email = email;
  user.roles = roles;
  user.active = active;

  if (password) {
    user.password = await bcryp.hash(password, 10);
  }

  const updatedUser = await user.save();

  res.json({ message: `${updatedUser.username} updated` });
};
//delete a user
//delete
const deleteUser = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "User Id required" });
  }

  //check on the notes

  const note = await Note.findOne({ user: id }).lean().exec();

  if (note) {
    return res.status(400).json({ message: "User has assign notes" });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User Not found" });
  }

  await user.deleteOne();
  const reply = `Username ${user.username} with ID ${user._id} deleted`;

  res.json(reply);
};

module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
  createFNewUser,
};
