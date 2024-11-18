const Jobs = require("../models/Jobs");
const City = require("../models/Cities");
const State = require("../models/States");
const Dept = require("../models/Department");
const Comp = require("../models/Company");
const Shift = require("../models/Shift");
const Myjobs = require("../models/Myjobs");
const Bookmark = require("../models/Bookmark");
const { ObjectId } = require('mongodb');

const getCompanyById = async (companyId) => {
  return await Comp.findById(companyId).lean().exec();
};

const getCityById = async (cityId) => {
  return await City.findById(cityId).lean().exec();
};
const getCityInfo = async () => {
  return await City.aggregate([
    {
      $lookup: {
        from: "states",
        localField: "state",
        foreignField: "_id",
        as: "stateInfo",
      },
    },
    {
      $lookup: {
        from: "companies",
        localField: "_id",
        foreignField: "city",
        as: "companies",
      },
    },
    {
      $addFields: {
        stateInfo: {
          $first: "$stateInfo",
        },
      },
    },
  ]).exec();
};
const getStateyById = async (stateId) => {
  return await State.findById(stateId).lean().exec();
};

const getDeptyById = async (depId) => {
  return await Dept.findById(depId).lean().exec();
};

const getShiftById = async (shiftId) => {
  return await Shift.findById(shiftId).lean().exec();
};

const findBookmarks = async ({ jobId, user }) => {
  return await Bookmark.findOne({ jobId, user });
};

const findallJobs = async () => {
  return await Jobs.find().lean();
};
const getAllJobs = async () => {
  return await Jobs.aggregate([
    {
      $lookup: {
        from: "companies",
        localField: "company",
        foreignField: "_id",
        as: "companyinfo",
      },
    },
    {
      $lookup: {
        from: "departments",
        localField: "department",
        foreignField: "_id",
        as: "departmentinfo",
      },
    },
    {
      $lookup: {
        from: "cities",
        localField: "companyinfo.city",
        foreignField: "_id",
        as: "cityInfo",
      },
    },
    {
      $lookup: {
        from: "shifts",
        localField: "shift",
        foreignField: "_id",
        as: "shiftinfo",
      },
    },
    {
      $addFields: {
        companyinfo: {
          $first: "$companyinfo",
        },
        departmentinfo: {
          $first: "$departmentinfo",
        },
        cityInfo: {
          $first: "$cityInfo",
        },
        shiftinfo: {
          $first: "$shiftinfo",
        },
      },
    },
  ]).exec();
};

const getMyJobs = async (userId) => {
  return await Myjobs.aggregate([
    {
      $match: {
        $and: [
          {
            user: ObjectId(userId),
          },
        ],
      },
    },
    {
      $lookup: {
        from: "jobs",
        localField: "jobId",
        foreignField: "_id",
        as: "jobsresult",
      },
    },
    {
      $lookup: {
        from: "companies",
        localField: "jobsresult.company",
        foreignField: "_id",
        as: "companyinfo",
      },
    },
    {
      $lookup: {
        from: "departments",
        localField: "jobsresult.department",
        foreignField: "_id",
        as: "departmentinfo",
      },
    },
    {
      $lookup: {
        from: "cities",
        localField: "companyinfo.city",
        foreignField: "_id",
        as: "cityInfo",
      },
    },
    {
      $lookup: {
        from: "shifts",
        localField: "jobsresult.shift",
        foreignField: "_id",
        as: "shiftinfo",
      },
    },
    {
      $addFields: {
        jobsresult: {
          $first: "$jobsresult",
        },
        companyinfo: {
          $first: "$companyinfo",
        },
        departmentinfo: {
          $first: "$departmentinfo",
        },
        cityInfo: {
          $first: "$departmentinfo",
        },
      },
    },
  ]);
};
const findJobByTitle = async ({ jobtitle, company }) => {
  return await Jobs.findOne({ jobtitle, company })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();
};

const findJobsById = async (id) => {
  return await Jobs.findById(id).exec();
};

const findMyJobsById = async (id) => {
  return await Myjobs.findById(id).remove().exec();
};

const findOneMyJob = async ({ jobId, user }) => {
  return await Myjobs.findOne({ jobId, user }).exec();
};

const findMyJobsByJobId = async (jobId) => {
  return await Myjobs.find({ jobId }).lean();
};
module.exports = {
  getCompanyById,
  getCityById,
  getCityInfo,
  getStateyById,
  getDeptyById,
  getShiftById,
  findBookmarks,
  findallJobs,
  findJobByTitle,
  findJobsById,
  findMyJobsById,
  findOneMyJob,
  findMyJobsByJobId,
  getAllJobs,
  getMyJobs,
};
