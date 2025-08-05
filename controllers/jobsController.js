/**
 * Controller for Jobs operations
 * @module controllers/jobsController
 */
const Jobs = require("../models/Jobs");
const Comp = require("../models/Company");
const City = require("../models/Cities");
const State = require("../models/States");
const Dept = require("../models/Department");
const Shift = require("../models/Shift");
const Myjob = require("../models/Myjobs");
const Pskill = require("../models/Pskills");
const utilscontroller=require('./utils');
const Profile = require('../models/Profile');

/**
 * Get detailed info for a single job
 */
/**
 * Calculate match percentage based on skill tags
 */
const calculateMatchPercentage = async (jobSkillTags, userId) => {
  try {
    if (!userId) return 0;
    
    // Get user skills
    const userSkills = await Pskill.find({ user: userId }).lean().exec();
    if (!userSkills || userSkills.length === 0) return 0;
    
    // Extract skill names from user skills
    const userSkillNames = userSkills.map(pskill => pskill.skill.toLowerCase());
    
    // Count matching skills
    const matchingSkills = jobSkillTags.filter(jobSkill => 
      userSkillNames.includes(jobSkill.toLowerCase())
    );
    
    // Calculate percentage
    const matchPercentage = Math.round((matchingSkills.length / jobSkillTags.length) * 100);
    
    return matchPercentage;
  } catch (error) {
    console.error('Error calculating match percentage:', error);
    return 0;
  }
};

const getjobdetailinfo = async (job, userId = null) => {
  const comp = await Comp.findById(job.company).lean().exec();
  const city = await City.findById(comp.city).lean().exec();
  const state = await State.findById(city.state).lean().exec();
  const dept = await Dept.findById(job.department).lean().exec();
  const shift = await Shift.findById(job.shift).lean().exec();
  const myjob = await Myjob.findOne({ jobId: job._id }).exec();
  
  // Calculate match percentage if userId is provided
  let matchPercentage = 0;
  if (userId && job.skillTags) {
    matchPercentage = await calculateMatchPercentage(job.skillTags, userId);
  }
  
  return {
    ...job,
    statename: state.name.substring(0, 2),
    cityname: city.name,
    compname: comp.name,
    compaddress: comp.address,
    shiftname: shift.title,
    deptname: dept.name,
    myjobStatus: myjob?.status || 'available',
    matchPercentage: matchPercentage,
  };
};

/**
 * Get detailed info for a list of jobs
 */
const getJobsDetails = async (jobs, userId = null) => {
  return await Promise.all(jobs.map(async (job) => getjobdetailinfo(job, userId)));
};

/**
 * Get all jobs
 * @route GET /jobs
 * @access Private
 */
const getAllJobs = async (req, res) => {
  try {
    const { userId } = req.query; // Get userId from query params for match calculation
    const jobs = await Jobs.find().lean().exec();
    if (!jobs?.length) {
      return res.status(400).json({ message: "No jobs found" });
    }
    const jobsDetails = await getJobsDetails(jobs, userId);
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
      jobDescription,
      jobRequirements,
      jobType,
      status,
      skillTags,
    } = req.body;
    if (!image || !jobtitle || !compId || !deptId || !weeks || !shiftId || !match || !salaryrange || !jobDescription || !jobRequirements || !jobType || !skillTags || !Array.isArray(skillTags) || skillTags.length === 0) {
      return res.status(400).json({ message: "All fields are required including at least one skill tag" });
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
      jobDescription,
      jobRequirements,
      jobType,
      status: status || 'Active',
      skillTags,
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
      jobDescription,
      jobRequirements,
      jobType,
      status,
      skillTags,
    } = req.body;
    if (!id || !image || !jobtitle || !deptId || !weeks || !shiftId || !match || !salaryrange || !compId || !jobDescription || !jobRequirements || !jobType || !skillTags || !Array.isArray(skillTags) || skillTags.length === 0) {
      return res.status(400).json({ message: "All fields are required including at least one skill tag" });
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
    jobs.jobDescription = jobDescription;
    jobs.jobRequirements = jobRequirements;
    jobs.jobType = jobType;
    jobs.status = status || jobs.status;
    jobs.skillTags = skillTags;
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

/**
 * View admin job details
 * @route GET /admin/jobDetails/:jobId
 * @access Private
 */
const viewAdminJobDetails = async (req, res) => {
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

/**
 * Get all jobs for a specific client/user
 * @route GET /jobs/:userId
 * @access Private
 */
const getAllClientJobs = async (req, res) => {
  try {
    const { userId } = req.params;
    const jobs = await Jobs.find().lean().exec();
    if (!jobs?.length) {
      return res.status(400).json({ message: "No jobs found" });
    }
    const jobsDetails = await getJobsDetails(jobs, userId);
    return res.json(jobsDetails);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Get jobs by status
 * @route GET /jobs/status/:status
 * @access Private
 */
const getJobsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const { userId } = req.query;
    const validStatuses = ['Active', 'Inactive', 'Closed', 'Draft'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be one of: Active, Inactive, Closed, Draft" });
    }
    
    const jobs = await Jobs.find({ status }).lean().exec();
    if (!jobs?.length) {
      return res.status(400).json({ message: `No ${status} jobs found` });
    }
    const jobsDetails = await getJobsDetails(jobs, userId);
    return res.json(jobsDetails);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Get jobs by type
 * @route GET /jobs/type/:jobType
 * @access Private
 */
const getJobsByType = async (req, res) => {
  try {
    const { jobType } = req.params;
    const { userId } = req.query;
    const validTypes = ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship'];
    
    if (!validTypes.includes(jobType)) {
      return res.status(400).json({ message: "Invalid job type. Must be one of: Full-time, Part-time, Contract, Temporary, Internship" });
    }
    
    const jobs = await Jobs.find({ jobType }).lean().exec();
    if (!jobs?.length) {
      return res.status(400).json({ message: `No ${jobType} jobs found` });
    }
    const jobsDetails = await getJobsDetails(jobs, userId);
    return res.json(jobsDetails);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Get jobs by skill match
 * @route GET /jobs/match/:minMatchPercentage
 * @access Private
 */
const getJobsBySkillMatch = async (req, res) => {
  try {
    const { minMatchPercentage } = req.params;
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ message: "userId is required for skill matching" });
    }
    
    const minMatch = parseInt(minMatchPercentage);
    if (isNaN(minMatch) || minMatch < 0 || minMatch > 100) {
      return res.status(400).json({ message: "minMatchPercentage must be a number between 0 and 100" });
    }
    
    const jobs = await Jobs.find().lean().exec();
    if (!jobs?.length) {
      return res.status(400).json({ message: "No jobs found" });
    }
    
    // Get jobs with match percentage >= minMatch
    const jobsWithMatch = await Promise.all(
      jobs.map(async (job) => {
        const jobDetail = await getjobdetailinfo(job, userId);
        return jobDetail;
      })
    );
    
    const filteredJobs = jobsWithMatch.filter(job => job.matchPercentage >= minMatch);
    
    if (!filteredJobs.length) {
      return res.status(400).json({ message: `No jobs found with ${minMatch}% or higher skill match` });
    }
    
    // Sort by match percentage (highest first)
    filteredJobs.sort((a, b) => b.matchPercentage - a.matchPercentage);
    
    return res.json(filteredJobs);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getAllJobs,
  getAllClientJobs,
  createNewJobs,
  updateJobs,
  deleteJobs,
  viewJobDetails,
  viewAdminJobDetails,
  getJobsByStatus,
  getJobsByType,
  getJobsBySkillMatch,
  getJobsDetails,
  getjobdetailinfo,
  calculateMatchPercentage,
};
