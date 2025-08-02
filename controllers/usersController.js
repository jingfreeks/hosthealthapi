/**
 * Controller for User operations
 * @module controllers/usersController
 */
const User = require("../models/Users");
const Note = require("../models/Notes");
const bcrypt = require("bcrypt");
const {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
} = require("../config/firebase");
const auth = getAuth();

/**
 * Get all users
 * @route GET /users
 * @access Private
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").lean().exec();
    if (!users?.length) {
      return res.status(400).json({ message: "No users Found", error: true });
    }
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Create a new user with Firebase
 * @route POST /users/firebase
 * @access Private
 */
const createFNewUser = async (req, res) => {
  try {
    const { email, password, roles } = req.body;
    const duplicate = await User.findOne({ email }).lean().exec();
    if (duplicate) {
      return res.status(409).json({ message: "Duplicate Email address" });
    }
    await createUserWithEmailAndPassword(auth, email, password);
    const hashedPwd = await bcrypt.hash(password, 10);
    const userObject =
      !Array.isArray(roles) || !roles.length
        ? { email, password: hashedPwd }
        : { email, password: hashedPwd, roles };
    const user = await User.create(userObject);
    if (user) {
      return res.status(201).json({ message: `New email ${email} created` });
    } else {
      return res.status(400).json({ message: "Invalid user data received" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Create a new user
 * @route POST /users
 * @access Private
 */
const createNewUser = async (req, res) => {
  try {
    const {email, username, password, roles } = req.body;
    console.log(username, password, roles);
    if (!username || !password) {
      return res.status(400).json({ message: "All fields are required", error: true });
    }
    const duplicate = await User.findOne({ username }).lean().exec();
    if (duplicate) {
      return res.status(409).json({ message: "Duplicate Username" });
    }
    const hashedPwd = await bcrypt.hash(password, 10);
    const userObject =
      !Array.isArray(roles) || !roles.length
        ? {email, username, password: hashedPwd }
        : { emailusername, password: hashedPwd, roles };
    const user = await User.create(userObject);
    if (user) {
      return res.status(201).json({ message: `New user ${username} created` });
    } else {
      return res.status(400).json({ message: "Invalid user data received" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Update a user
 * @route PATCH /users
 * @access Private
 */
const updateUser = async (req, res) => {
  try {
    const { id, username, roles, active, password, email } = req.body;
    if (!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== "boolean") {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findById(id).exec();
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const duplicate = await User.findOne({ username })
      .collation({ locale: "en", strength: 2 })
      .lean()
      .exec();
    if (duplicate && duplicate?._id.toString() !== id) {
      return res.status(409).json({ message: "Duplicate Username" });
    }
    user.username = username;
    user.email = email;
    user.roles = roles;
    user.active = active;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    const updatedUser = await user.save();
    return res.json({ message: `${updatedUser.username} updated` });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Delete a user
 * @route DELETE /users
 * @access Private
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ message: "User Id required" });
    }
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
    return res.json(reply);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
  createFNewUser,
};
