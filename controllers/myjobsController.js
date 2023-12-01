const Jobs = require("../models/Jobs");
const Myjobs = require("../models/Myjobs")
const City = require("../models/Cities");
const State = require("../models/States");
const Dept = require("../models/Department");
const Comp = require("../models/Company");
const Shift = require("../models/Shift");
const User = require('../models/Users')

// @desc Get all my jobs
// @route GET /jobs/myjobs
// @access Private
const getMyJobs = async (req, res) => {
   const {userId}=req.params;
  if(!userId){
    return res.status(400).json({ message: "User Id should be requried" });
  }
  // Get all notes from MongoDB
  const myJobs = await Myjobs.find({user:userId}).lean();

  // If no city 
  if (!myJobs?.length) {
    return res.status(400).json({ message: "No jobs found" });
  }

  // Add state to each city before sending the response
  // You could also do this with a for...of loop
  const myjobsDetail = await Promise.all(
    myJobs.map(async (myjob) => {
      const jobs=  await Jobs.findById(myjob.jobId).lean().exec();
      const comp = await Comp.findById(jobs.company).lean().exec();
      const city = await City.findById(comp.city).lean().exec();
      const state = await State.findById(city.state).lean().exec();
      const dept = await Dept.findById(jobs.department).lean().exec();
      const shift = await Shift.findById(jobs.shift).lean().exec();
      return {
        ...myjob,
        salaryrange:jobs.salaryrange,
        image:jobs.image,
        jobtitle:jobs.jobtitle, 
        match:jobs.match,
        statename: state.name.substring(0, 2),
        cityname: city.name,
        compname: comp.name,
        compaddress: comp.address,
        shiftname: shift.title,
        deptname: dept.name,
      };
    })
  );
  res.json(myjobsDetail);
};

// @desc Create new my jobs
// @route POST /jobs/myjobs
// @access Private
const createInterestedJobs = async (req, res) => {
  try {
    const {
      jobId,
      userId,
    } = req.body;

    // Confirm data
    if (
      !jobId ||
      !userId
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check for duplicate title
    const duplicate = await Myjobs.findOne({ jobId,user: userId})
      .collation({ locale: "en", strength: 2 })
      .lean()
      .exec();

    if (duplicate) {
      return res.status(409).json({ message: "Duplicate Jobs selected" });
    }

    // confirm for existing user to create
    const user = await User.findById(userId).exec();

    if (!user) {
      res.status(400).json({ message: "User not found" });
    }

    // Create and store the new jobs
    const myjobs = await Myjobs.create({
        jobId,
        user:userId,
        status:'Interested',
    });
    if (myjobs) {
      // Created
      return res.status(201).json({ message: "Interested Jobs created" });
    } else {
      return res.status(400).json({ message: "Invalid jobs data received" });
    }
  } catch (error) {
    console.log("error", error);
  }
};

// @desc Update a status of jobs
// @route PATCH /jobs/myjob
// @access Private
const updateMyStatus = async (req, res) => {
  const {
    jobId,
    userId,
    status,
    id,
  } = req.body;

  // Confirm data
  if (
    !id ||
    !jobId ||
    !userId ||
    !status
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // confirm for existing Jobs to update
  const jobs=  await Jobs.findById(jobId).lean().exec();
  if (!jobs) {
    return res.status(400).json({ message: "Job id not found" });
  }
    // confirm for existing user to create
const user = await User.findById(userId).exec();

    if (!user) {
      res.status(400).json({ message: "User not found" });
    }

  jobs.jobId = image;
  jobs.userId = cityId;
  jobs.status = jobtitle;

  const updatedJobs = await jobs.save();

  res.json(`'${updatedJobs.jobtitle}' jobs  updated`);
};

// @desc Delete a jobs status
// @route DELETE /jobs/myjob
// @access Private
const deleteMyJobs = async (req, res) => {
  const { id } = req.body;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "My Job ID required" });
  }

  //check if this exist to jobs before deleting

  // Confirm city exists to delete
  const jobs = await Myjobs.findById(id).exec();

  if (!jobs) {
    return res.status(400).json({ message: "Jobs not found" });
  }

  const result = await Myjobs.deleteOne();

  const reply = `Jobs '${result.name}' with ID ${result._id} deleted`;

  res.json(reply);
};

module.exports = { getMyJobs,createInterestedJobs,updateMyStatus,deleteMyJobs };
