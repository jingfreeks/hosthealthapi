const Jobs = require("../models/Jobs");
const utilscontroller=require('./utils');
const User = require("../models/Users");
const Profile = require('../models/Profile');

const getjobdetailinfo = async (job) => {
  const comp = await utilscontroller.getCompanyById(job.company);
  const city= await utilscontroller.getCityById(comp.city);
  const state= await utilscontroller.getStateyById(city.state);
  const dept= await utilscontroller.getDeptyById(job.department);
  const shift = await utilscontroller.getShiftById(job.shift)
  
  return {
    ...job,
    statename: state.name.substring(0, 2),
    cityname: city.name,
    compname: comp.name,
    compaddress: comp.address,
    shiftname: shift.title,
    deptname: dept.name,
  };
};

const getJobsDetails = async (jobs, userId) => {
  return await Promise.all(
    jobs.map(async (job) => {
      const jdetail = await getjobdetailinfo(job);
      const bookmark = await utilscontroller.findBookmarks({ jobId: job._id, user: userId });
      return { ...jdetail, bookmark: bookmark ? true : false };
    })
  );
};

const fetchAllJobs=async()=>{
  // fetch all jobs from MongoDB
  const jobs = await utilscontroller.findallJobs();
 
  // If jobs is not exist
  if (!jobs?.length) {
    return res.status(400).json({ message: "No jobs found" });
  }

  return jobs
}
// @desc Get all jobs
// @route GET /jobs
// @access Private
const getAllJobs = async (req, res) => {
  
  const { userId } = req.params;
  // const jobs = await utilscontroller.findallJobs();
 
  // // If no jobs
  // if (!jobs?.length) {
  //   return res.status(400).json({ message: "No jobs found" });
  // }
  const jobs = await fetchAllJobs()
  const jobsDetails = await getJobsDetails(jobs, userId);
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
    const duplicate = await utilscontroller.findJobByTitle({ jobtitle, company: compId })
    if (duplicate) {
      return res.status(409).json({ message: "Duplicate Job information" });
    }

    // confirm for existing company to create
    const comp=await utilscontroller.getCompanyById(compId)
    if (!comp) {
      return res.status(400).json({ message: "Company not found in our list" });
    }

    // confirm for existing department to create
    const dept = await utilscontroller.getDeptyById(deptId)
    if (!dept) {
      return res
        .status(400)
        .json({ message: "Department not found in our list" });
    }

    // confirm for existing shift to create
    const shift = await utilscontroller.getShiftById(shiftId)
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
  const dept = await utilscontroller.getDeptyById(deptId)
  if (!dept) {
    return res
      .status(400)
      .json({ message: "Department not found in our list" });
  }

  // confirm for existing shift to update
  const shift = await utilscontroller.getShiftById(shiftId)
  if (!shift) {
    return res.status(400).json({ message: "Shift  not found in our list" });
  }

  const duplicate = await utilscontroller.findJobByTitle({ jobtitle, company: compId })

  // Allow renaming of the original note
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate Jobs in the company" });
  }
  // const jobs = await Jobs.findById(id).exec();
  const jobs = await utilscontroller.findJobsById(id);
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
  const jobs = await utilscontroller.findJobsById(id);
  if (!jobs) {
    return res.status(400).json({ message: "City not found" });
  }

  const result = await jobs.deleteOne();

  const reply = `Jobs '${result.name}' with ID ${result._id} deleted`;

  res.json(reply);
};

const getJobDetails=async(jobId)=>{
  const jobs = await utilscontroller.findJobsById(jobId)
 
  if (!jobs) {
    return res.status(400).json({ message: "Job is not found in our list" });
  }
  return await getjobdetailinfo(jobs);
}
const viewJobDetails = async (req, res) => {
  const { jobId,userId } = req.params;

  // const jobs = await utilscontroller.findJobsById(jobId)

  // if (!jobs) {
  //   return res.status(400).json({ message: "Job is not found in our list" });
  // }

  const jobsDetails = await getJobDetails(jobId);
  const myjob = await utilscontroller.findOneMyJob({ jobId,user:userId })
  res.json({ ...jobsDetails, status: myjob?.status || "available" });
};
const viewUserInfo=async(userId)=>{
  return await Profile.findOne({user:userId}).lean().exec();
}
const viewAdminJobDetails=async(req,res)=>{
  const { jobId } = req.params;
  //get the job details


  //get interested
  const jobsList= await utilscontroller.findMyJobsByJobId(jobId)
  const users=await Promise.all(
    jobsList.map(async (job) => {
      const userinfo=await viewUserInfo(job.user)
      return { ...userinfo };
    })
  );
  const jobsDetails = await getJobDetails(jobId);
 
  res.json({...jobsDetails,interested:users})
}
module.exports = {
  getAllJobs,
  createNewJobs,
  updateJobs,
  deleteJobs,
  viewJobDetails,
  getJobsDetails,
  getjobdetailinfo,
  viewAdminJobDetails
};
