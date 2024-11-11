const Jobs = require("../models/Jobs");
const City = require("../models/Cities");
const State = require("../models/States");
const Dept = require("../models/Department");
const Comp = require("../models/Company");
const Shift = require("../models/Shift");
const Myjobs = require("../models/Myjobs");
const Bookmark = require("../models/Bookmark");

const getCompanyById = async (companyId) => {
  return await Comp.findById(companyId).lean().exec();
};

const getCityById = async (cityId) => {
  return await City.findById(cityId).lean().exec();
};
const getCityInfo = async()=>{
return await City.aggregate([{
    $lookup: {
    from: "states",
    localField: "state",
    foreignField: "_id",
    as: "statename"
  }},
  {
    $addFields: {
      statename:{
        $first:"$statename"
      }
    }
  }]).exec()
}
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

const findJobByTitle = async ({ jobtitle, company }) => {
  return await Jobs.findOne({ jobtitle, company })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();
};

const findJobsById = async (id) => {
  return await Jobs.findById(id).exec()
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
};
