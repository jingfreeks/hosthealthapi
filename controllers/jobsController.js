const Jobs = require("../models/Jobs");
const City = require("../models/Cities");
const State = require("../models/States");
const Dept = require("../models/Department");
const Comp = require("../models/Company");
const Shift = require("../models/Shift");

// @desc Get all jobs
// @route GET /jobs
// @access Private
const getAllJobs = async (req, res) => {
  // Get all notes from MongoDB
  const jobs = await Jobs.find().lean();

  // If no city
  if (!jobs?.length) {
    return res.status(400).json({ message: "No jobs found" });
  }

  // Add state to each city before sending the response
  // You could also do this with a for...of loop
  const jobsDetails = await Promise.all(
    jobs.map(async (job) => {
      const comp = await Comp.findById(job.company).lean().exec();
      const city = await City.findById(comp.city).lean().exec();
      const state = await State.findById(city.state).lean().exec();
      const dept = await Dept.findById(job.department).lean().exec();
      const shift = await Shift.findById(job.shift).lean().exec();
      return {
        ...job,
        statename: state.name.substring(0, 2),
        cityname: city.name,
        compname: comp.name,
        compaddress: comp.address,
        shiftname: shift.title,
        deptname: dept.name,
      };
    })
  );
  res.json(jobsDetails);
};

// @desc Create new jobs
// @route POST /jobs
// @access Private
const createNewJobs = async (req, res) => {
  try {
    const {
      image,
      jobtitle,
      compId,
      deptId,
      weeks,
      shiftId,
      match,
      salaryrange,
    } = req.body;

    // Confirm data
    if (
      !image ||
      !jobtitle ||
      !compId ||
      !deptId ||
      !weeks ||
      !shiftId ||
      !match ||
      !salaryrange
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check for duplicate title
    const duplicate = await Jobs.findOne({ jobtitle,company: compId})
      .collation({ locale: "en", strength: 2 })
      .lean()
      .exec();

    if (duplicate) {
      return res.status(409).json({ message: "Duplicate Job information" });
    }

    // confirm for existing company to create
    const comp = await Comp.findById(compId).exec();
    if (!comp) {
      return res.status(400).json({ message: "Company not found in our list" });
    }

    // confirm for existing department to create
    const dept = await Dept.findById(deptId).exec();
    if (!dept) {
      return res
        .status(400)
        .json({ message: "Department not found in our list" });
    }

    // confirm for existing shift to create

    const shift = await Shift.findById(shiftId).exec();
    if (!shift) {
      return res.status(400).json({ message: "Shift  not found in our list" });
    }

    // Create and store the new jobs
    const jobs = await Jobs.create({
      image,
      jobtitle,
      company: compId,
      department: deptId,
      weeks,
      shift: shiftId,
      match,
      salaryrange,
    });
    if (jobs) {
      // Created
      return res.status(201).json({ message: "New jobs created" });
    } else {
      return res.status(400).json({ message: "Invalid jobs data received" });
    }
  } catch (error) {
    console.log("error", error);
  }
};

// @desc Update a jobs
// @route PATCH /jobs
// @access Private
const updateJobs = async (req, res) => {
  const {
    id,
    image,
    jobtitle,
    compId,
    deptId,
    weeks,
    shiftId,
    match,
    salaryrange,
  } = req.body;

  // Confirm data
  if (
    !id ||
    !image ||
    !jobtitle ||
    !deptId ||
    !weeks ||
    !shiftId ||
    !match ||
    !salaryrange ||
    !compId
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // confirm for existing department to update
  const dept = await Dept.findById(deptId).exec();
  if (!dept) {
    return res
      .status(400)
      .json({ message: "Department not found in our list" });
  }

  // confirm for existing shift to update

  const shift = await Shift.findById(shiftId).exec();
  if (!shift) {
    return res.status(400).json({ message: "Shift  not found in our list" });
  }
  // Check for duplicate title
  const duplicate = await Jobs.findOne({ jobtitle })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  // Allow renaming of the original note
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate Jobs in the company" });
  }
  const jobs = await Jobs.findById(id).exec();
  if (!jobs) {
    return res.status(400).json({ message: "City not found" });
  }
  jobs.image = image;
  jobs.jobtitle = jobtitle;
  jobs.company = compId;
  jobs.department = deptId;
  jobs.weeks = weeks;
  jobs.shift = shiftId;
  jobs.match = match;
  jobs.salaryrange = salaryrange;
  const updatedJobs = await jobs.save();

  res.json(`'${updatedJobs.jobtitle}' jobs  updated`);
};

// @desc Delete a jobs
// @route DELETE /jobs
// @access Private
const deleteJobs = async (req, res) => {
  const { id } = req.body;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "Job ID required" });
  }

  //check if this exist to jobs before deleting

  // Confirm city exists to delete
  const jobs = await Jobs.findById(id).exec();

  if (!jobs) {
    return res.status(400).json({ message: "City not found" });
  }

  const result = await jobs.deleteOne();

  const reply = `Jobs '${result.name}' with ID ${result._id} deleted`;

  res.json(reply);
};

module.exports = { getAllJobs, createNewJobs, updateJobs, deleteJobs };
