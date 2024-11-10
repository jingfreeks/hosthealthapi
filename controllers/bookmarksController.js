
const BookMarks = require("../models/Bookmark")
const User = require("../models/Users")

const addRemoveBookMarks = async (req, res) => {
  try {
    const { jobId, userId } = req.body;
    console.log('jobId',jobId,userId)
    // Confirm data
    if (!jobId || !userId) {
      return res.status(400).json({ message: "All fields are required" });
    }
    // confirm for existing user to create
    const user = await User.findById(userId).exec();

    if (!user) {
      res.status(400).json({ message: "User not found" });
    }
    // Check for duplicate title
    const duplicate = await BookMarks.findOne({ jobId, user: userId })
      .collation({ locale: "en", strength: 2 })
      .lean()
      .exec();

    if (duplicate) {
        const bookmark = await BookMarks.findById(duplicate._id).exec();
      
        const result = await bookmark.deleteOne();
      
        const reply = `Jobs '${result.name}' with ID ${result._id} deleted`;
        res.json(reply);
    }else{
        await BookMarks.create({
            jobId,
            user: userId,
          });
          return res.status(201).json({ message: "Bookmark Jobs created" });
    }
  } catch (error) {
    console.log("error", error);
  }
};

module.exports = {
    addRemoveBookMarks,
};
