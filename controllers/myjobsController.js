/**
 * Controller for MyJobs operations
 * @module controllers/myjobsController
 */
const Jobs = require("../models/Jobs");
const Myjobs = require("../models/Myjobs");
const City = require("../models/Cities");
const State = require("../models/States");
const Dept = require("../models/Department");
const Comp = require("../models/Company");
const Shift = require("../models/Shift");
const User = require('../models/Users');

/**
 * Get all jobs for a user
 * @route GET /jobs/myjobs
 * @access Private
 */
const getMyJobs = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "User Id should be required" });
    }
    const myJobs = await Myjobs.find({ user: userId }).lean().exec();
    if (!myJobs?.length) {
      return res.status(400).json({ message: "No jobs found" });
    }
    const myjobsDetail = await Promise.all(
      myJobs.map(async (myjob) => {
        const jobs = await Jobs.findById(myjob.jobId).lean().exec();
        const comp = await Comp.findById(jobs.company).lean().exec();
        const city = await City.findById(comp.city).lean().exec();
        const state = await State.findById(city.state).lean().exec();
        const dept = await Dept.findById(jobs.department).lean().exec();
        const shift = await Shift.findById(jobs.shift).lean().exec();
        return {
          ...myjob,
          salaryrange: jobs.salaryrange,
          image: jobs.image,
          jobtitle: jobs.jobtitle,
          match: jobs.match,
          statename: state.name.substring(0, 2),
          cityname: city.name,
          compname: comp.name,
          compaddress: comp.address,
          shiftname: shift.title,
          deptname: dept.name,
        };
      })
    );
    return res.json(myjobsDetail);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Create a new interested job for a user
 * @route POST /jobs/myjobs
 * @access Private
 */
const createInterestedJobs = async (req, res) => {
  try {
    const { jobId, userId } = req.body;
    if (!jobId || !userId) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const duplicate = await Myjobs.findOne({ jobId, user: userId })
      .collation({ locale: "en", strength: 2 })
      .lean()
      .exec();
    if (duplicate) {
      return res.status(409).json({ message: "Duplicate Jobs selected" });
    }
    const user = await User.findById(userId).exec();
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const myjobs = await Myjobs.create({ jobId, user: userId, status: 'Interested' });
    if (myjobs) {
      return res.status(201).json({ message: "Interested Jobs created" });
    } else {
      return res.status(400).json({ message: "Invalid jobs data received" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Update the status of a user's job
 * @route PATCH /jobs/myjob
 * @access Private
 */
const updateMyStatus = async (req, res) => {
  try {
    const { jobId, userId, status, id } = req.body;
    if (!id || !jobId || !userId || !status) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const jobs = await Jobs.findById(jobId).lean().exec();
    if (!jobs) {
      return res.status(400).json({ message: "Job id not found" });
    }
    const user = await User.findById(userId).exec();
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    // Find the myjob document to update
    const myjob = await Myjobs.findById(id).exec();
    if (!myjob) {
      return res.status(400).json({ message: "MyJob not found" });
    }
    myjob.status = status;
    const updatedMyJob = await myjob.save();
    return res.json(`'${updatedMyJob._id}' job status updated`);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Delete a user's job status
 * @route DELETE /jobs/myjob
 * @access Private
 */
const deleteMyJobs = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ message: "My Job ID required" });
    }
    const myjob = await Myjobs.findById(id).exec();
    if (!myjob) {
      return res.status(400).json({ message: "Jobs not found" });
    }
    const result = await myjob.deleteOne();
    const reply = `Job '${result._id}' deleted`;
    return res.json(reply);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getMyJobs,
  createInterestedJobs,
  updateMyStatus,
  deleteMyJobs,
};
