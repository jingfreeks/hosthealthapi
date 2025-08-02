/**
 * Controller for Jobs operations
 * @module controllers/jobsController
 */
const Jobs = require("../models/Jobs");
const utilscontroller=require('./utils');
const Profile = require('../models/Profile');

/**
 * Get detailed info for a single job
 */
const getjobdetailinfo = async (job) => {
  const comp = await Comp.findById(job.company).lean().exec();
  const city = await City.findById(comp.city).lean().exec();
  const state = await State.findById(city.state).lean().exec();
  const dept = await Dept.findById(job.department).lean().exec();
  const shift = await Shift.findById(job.shift).lean().exec();
  const myjob = await Myjob.findOne({ jobId: job._id }).exec();
  return {
    ...job,
    statename: state.name.substring(0, 2),
    cityname: city.name,
    compname: comp.name,
    compaddress: comp.address,
    shiftname: shift.title,
    deptname: dept.name,
    status: myjob?.status || 'available',
  };
};

/**
 * Get detailed info for a list of jobs
 */
const getJobsDetails = async (jobs) => {
  return await Promise.all(jobs.map(async (job) => getjobdetailinfo(job)));
};

/**
 * Get all jobs
 * @route GET /jobs
 * @access Private
 */
const getAllJobs = async (req, res) => {
  try {
    const jobs = await Jobs.find().lean().exec();
    if (!jobs?.length) {
      return res.status(400).json({ message: "No jobs found" });
    }
    const jobsDetails = await getJobsDetails(jobs);
    return res.json(jobsDetails);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Create new jobs
 * @route POST /jobs
 * @access Private
 */
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
    if (!image || !jobtitle || !compId || !deptId || !weeks || !shiftId || !match || !salaryrange) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const duplicate = await Jobs.findOne({ jobtitle, company: compId })
      .collation({ locale: "en", strength: 2 })
      .lean()
      .exec();
    if (duplicate) {
      return res.status(409).json({ message: "Duplicate Job information" });
    }
    const comp = await Comp.findById(compId).exec();
    if (!comp) {
      return res.status(400).json({ message: "Company not found in our list" });
    }
    const dept = await Dept.findById(deptId).exec();
    if (!dept) {
      return res.status(400).json({ message: "Department not found in our list" });
    }
    const shift = await Shift.findById(shiftId).exec();
    if (!shift) {
      return res.status(400).json({ message: "Shift  not found in our list" });
    }
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
      return res.status(201).json({ message: "New jobs created" });
    } else {
      return res.status(400).json({ message: "Invalid jobs data received" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Update a job
 * @route PATCH /jobs
 * @access Private
 */
const updateJobs = async (req, res) => {
  try {
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
    if (!id || !image || !jobtitle || !deptId || !weeks || !shiftId || !match || !salaryrange || !compId) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const dept = await Dept.findById(deptId).exec();
    if (!dept) {
      return res.status(400).json({ message: "Department not found in our list" });
    }
    const shift = await Shift.findById(shiftId).exec();
    if (!shift) {
      return res.status(400).json({ message: "Shift  not found in our list" });
    }
    const duplicate = await Jobs.findOne({ jobtitle })
      .collation({ locale: "en", strength: 2 })
      .lean()
      .exec();
    if (duplicate && duplicate?._id.toString() !== id) {
      return res.status(409).json({ message: "Duplicate Jobs in the company" });
    }
    const jobs = await Jobs.findById(id).exec();
    if (!jobs) {
      return res.status(400).json({ message: "Job not found" });
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
    return res.json(`'${updatedJobs.jobtitle}' job updated`);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Delete a job
 * @route DELETE /jobs
 * @access Private
 */
const deleteJobs = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ message: "Job ID required" });
    }
    const jobs = await Jobs.findById(id).exec();
    if (!jobs) {
      return res.status(400).json({ message: "Job not found" });
    }
    const result = await jobs.deleteOne();
    const reply = `Job '${result.name}' with ID ${result._id} deleted`;
    return res.json(reply);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * View job details
 * @route GET /jobs/:jobId
 * @access Private
 */
const viewJobDetails = async (req, res) => {
  try {
    const { jobId } = req.params;
    const jobs = await Jobs.findById(jobId).exec();
    if (!jobs) {
      return res.status(400).json({ message: "Job is not found in our list" });
    }
    const jobsDetails = await getjobdetailinfo(jobs);
    return res.json(jobsDetails);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getAllJobs,
  createNewJobs,
  updateJobs,
  deleteJobs,
  viewJobDetails,
  getJobsDetails,
  getjobdetailinfo,
};
