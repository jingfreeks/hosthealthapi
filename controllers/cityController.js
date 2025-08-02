const City = require("../models/Cities");
const State = require("../models/States");
const Company = require("../models/Company");
const Jobs = require('../models/Jobs');
const JobsController = require('./jobsController');

// Helper: Get number of jobs for companies in a city
const getMatches = async (id) => {
  let matches = 0;
  const companies = await getCompanies(id);
  await Promise.all(companies.map(async (company) => {
    const jobsList = await Jobs.find({ company: company._id }).count();
    matches = matches + jobsList;
  }));
  return matches;
};

// Helper: Get companies in a city
const getCompanies = async (id) => {
  return await Company.find({ city: id }).lean();
};

// @desc Get jobs by city
// @route GET /city/:cityId
// @access Private
const getCitiesByJobs = async (req, res) => {
  let jobsCity = [];
  const { cityId } = req.params;
  const companies = await getCompanies(cityId);
  await Promise.all(companies.map(async (company) => {
    const jobslist = await Jobs.find({ company: company._id }).lean();
    const joblist = await Promise.all(jobslist.map(async (job) => JobsController.getjobdetailinfo(job)));
    jobsCity = [...jobsCity, ...joblist];
  }));
  res.json(jobsCity);
};

// @desc Get all cities
// @route GET /city
// @access Private
const getAllCities = async (req, res) => {
  const cities = await City.find().lean();
  if (!cities?.length) {
    return res.status(400).json({ message: "No city found" });
  }
  const citiesWithStates = await Promise.all(
    cities.map(async (city) => {
      const state = await State.findById(city.state).lean().exec();
      const matches = await getMatches(city._id);
      return { ...city,stateId:state._id, statename: state.name, matches, salary: "$2,659" };
    })
  );
  res.json(citiesWithStates);
};

// @desc Create new city
// @route POST /city
// @access Private
const createNewCities = async (req, res) => {
  try {
    const { name, stateId, image } = req.body;
    console.log("createNewCities", req.body);
    if (!name || !stateId || !image) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const duplicate = await City.findOne({ name })
      .collation({ locale: "en", strength: 2 })
      .lean()
      .exec();
    if (duplicate) {
      return res.status(409).json({ message: "Duplicate city name" });
    }
    const state = await State.findById(stateId).exec();
    if (!state) {
      return res.status(400).json({ message: "State not found" });
    }
    const city = await City.create({ name, state: stateId, image });
    if (city) {
      return res.status(201).json({ message: "New city created" });
    } else {
      return res.status(400).json({ message: "Invalid city data received" });
    }
  } catch (error) {
    console.log("error", error);
  }
};

// @desc Update a city
// @route PATCH /city
// @access Private
const updateCity = async (req, res) => {
  const { id, name, stateId, image } = req.body;
  if (!id || !name || !stateId || !image) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const state = await State.findById(stateId).exec();
  if (!state) {
    return res.status(400).json({ message: "State not found" });
  }
  const city = await City.findById(id).exec();
  if (!city) {
    return res.status(400).json({ message: "City not found" });
  }
  const duplicate = await City.findOne({ name })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate City name" });
  }
  city.name = name;
  city.state = stateId;
  city.image = image;
  const updatedCity = await city.save();
  res.json(`'${updatedCity.name}' city updated`);
};

// @desc Delete a city
// @route DELETE /city
// @access Private
const deleteCity = async (req, res) => {
  const { _id } = req.body;
  if (!_id) {
    return res.status(400).json({ message: "City ID required" });
  }
  const city = await City.findById(_id).exec();
  if (!city) {
    return res.status(400).json({ message: "City not found" });
  }
  const result = await city.deleteOne();
  const reply = `City '${result.name}' with ID ${result._id} deleted`;
  res.json(reply);
};

module.exports = {
  getAllCities,
  createNewCities,
  updateCity,
  deleteCity,
  getCitiesByJobs,
};
