/**
 * Controller for Company operations
 * @module controllers/compController
 */
const City = require("../models/Cities");
const State = require("../models/States");
const Company = require("../models/Company");

/**
 * Get all companies with city and state info
 * @route GET /company
 * @access Private
 */
const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find().lean().exec();
    if (!companies?.length) {
      return res.status(400).json({ message: "No company found" });
    }
    const companyWithCityStates = await Promise.all(
      companies.map(async (company) => {
        const city = await City.findById(company.city).lean().exec();
        const state = city ? await State.findById(city.state).lean().exec() : null;
        return {
          ...company,
          cityId: city ? city._id : undefined,
          cityname: city ? city.name : undefined,
          state: state ? state.name.substring(0, 2).toUpperCase() : undefined,
        };
      })
    );
    return res.json(companyWithCityStates);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Create a new company
 * @route POST /company
 * @access Private
 */
const createNewCompany = async (req, res) => {
  try {
    const { name, address, cityId } = req.body;
    if (!name || !cityId) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const duplicate = await Company.findOne({ name, address })
      .collation({ locale: "en", strength: 2 })
      .lean()
      .exec();
    if (duplicate) {
      return res.status(409).json({ message: "Duplicate company name" });
    }
    const company = await Company.create({ name, address, city: cityId });
    if (company) {
      return res.status(201).json({ message: "New company created" });
    } else {
      return res.status(400).json({ message: "Invalid company data received" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Update a company
 * @route PATCH /company
 * @access Private
 */
const updateCompany = async (req, res) => {
  try {
    const { _id, name, address, cityId } = req.body;
    if (!_id || !name || !address || !cityId) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const company = await Company.findById(_id).exec();
    if (!company) {
      return res.status(400).json({ message: "Company not found" });
    }
    const city = await City.findById(cityId).exec();
    if (!city) {
      return res.status(400).json({ message: "City not found" });
    }
    const duplicate = await Company.findOne({ name, address })
      .collation({ locale: "en", strength: 2 })
      .lean()
      .exec();
    if (duplicate && duplicate?._id.toString() !== _id) {
      return res.status(409).json({ message: "Duplicate company information" });
    }
    company.name = name;
    company.address = address;
    company.city = cityId;
    const updatedCompany = await company.save();
    return res.json(`'${updatedCompany.name}' company updated`);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Delete a company
 * @route DELETE /company
 * @access Private
 */
const deleteCompany = async (req, res) => {
  try {
    const { _id } = req.body;
    if (!_id) {
      return res.status(400).json({ message: "Company ID required" });
    }
    const company = await Company.findById(_id).exec();
    if (!company) {
      return res.status(400).json({ message: "Company not found" });
    }
    const result = await company.deleteOne();
    const reply = `Company '${result.name}' with ID ${result._id} deleted`;
    return res.json(reply);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getAllCompanies,
  createNewCompany,
  updateCompany,
  deleteCompany,
};
