const City = require("../models/Cities");
const State = require("../models/States");
const Company = require("../models/Company")

// @desc Get all companies
// @route GET /company
// @access Private
const getAllCompanies = async (req, res) => {
  // Get all notes from MongoDB
  const company = await Company.find().lean();

  // If no city
  if (!company?.length) {
    return res.status(400).json({ message: "No company found" });
  }


  // Add state to each city before sending the response
  // You could also do this with a for...of loop
  const companyWithCityStates = await Promise.all(
    company.map(async (company) => {
   
      const city= await City.findById(company.city)
      const state = await State.findById(city.state).lean().exec();
      return { ...company,cityname:city.name, state: state.name.substring(0,2).toUpperCase() };
    })
  );
  res.json(companyWithCityStates);
};

// @desc Create new company
// @route POST /company
// @access Private
const createNewCompany = async (req, res) => {
  try {
    const { name,address,cityId } = req.body;

    // Confirm data
    if (!name || !cityId ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check for duplicate title
    const duplicate = await Company.findOne({ name,address })
      .collation({ locale: "en", strength: 2 })
      .lean()
      .exec();

    if (duplicate) {
      return res.status(409).json({ message: "Duplicate company name" });
    }

    // Create and store the new city
    const company = await Company.create({ name,address,city:cityId });
    if (company) {
      // Created
      return res.status(201).json({ message: "New company created" });
    } else {
      return res.status(400).json({ message: "Invalid company data received" });
    }
  } catch (error) {
    console.log("error", error);
  }
};

// @desc Update a company
// @route PATCH /company
// @access Private
const updateCompany = async (req, res) => {
  const { id, name,address,cityId } = req.body;

  // Confirm data
  if (!id || !name || !address || !cityId) {
    return res.status(400).json({ message: "All fields are required" });
  }

  //Confirm company exist to update
  const company =await Company.findById(id).exec();

  if(!company){
    return res.status(400).json({ message: "Company not found" });
  }
  // Confirm city exists to update
  const city = await City.findById(cityId).exec();

  if (!city) {
    return res.status(400).json({ message: "City not found" });
  }
  
  // Check for duplicate title
  const duplicate = await Company.findOne({ name,address })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  // Allow renaming of the original note
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate company information" });
  }

  company.name = name;
  company.address=address;
  company.city =cityId;
  const updatedState = await company.save();

  res.json(`'${updatedState.name}' company  updated`);
};

// @desc Delete a company
// @route DELETE /company
// @access Private
const deleteCompany = async (req, res) => {
  const { id } = req.body;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "Company ID required" });
  }

  //check if this exist to jobs before deleting
  
  // Confirm city exists to delete
  const company = await Company.findById(id).exec();

  if (!company) {
    return res.status(400).json({ message: "Company not found" });
  }

  const result = await company.deleteOne();

  const reply = `Company '${result.name}' with ID ${result._id} deleted`;

  res.json(reply);
};

module.exports = {
    getAllCompanies,
    createNewCompany,
    updateCompany,
    deleteCompany
}
