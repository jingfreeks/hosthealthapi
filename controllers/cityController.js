const City = require("../models/Cities");
const State = require("../models/States");

// @desc Get all city
// @route GET /city
// @access Private
const getAllCities = async (req, res) => {
  // Get all notes from MongoDB
  const cities = await City.find().lean();

  // If no city
  if (!cities?.length) {
    return res.status(400).json({ message: "No city found" });
  }


  // Add state to each city before sending the response
  // You could also do this with a for...of loop
  const citiesWithStates = await Promise.all(
    cities.map(async (city) => {
      const state = await State.findById(city.state).lean().exec();
      return { ...city, statename: state.name,matches:'15',salary:"$2,659" };
    })
  );
  res.json(citiesWithStates);
};

// @desc Create new city
// @route POST /city
// @access Private
const createNewCities = async (req, res) => {
  try {
    const { name,stateId,image } = req.body;

    // Confirm data
    if (!name || !stateId || !image) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check for duplicate title
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
    // Create and store the new city
    const city = await City.create({ name,state:stateId,image });
    if (city) {
      // Created
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
  const { id, name,stateId,image } = req.body;

  // Confirm data
  if (!id || !name || !stateId || !image) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Confirm city exists to update
  const state = await State.findById(stateId).exec();
  if (!state) {
    return res.status(400).json({ message: "State not found" });
  }
  const city = await City.findById(id).exec();

  if (!city) {
    return res.status(400).json({ message: "City not found" });
  }

  // Check for duplicate title
  const duplicate = await City.findOne({ name })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  // Allow renaming of the original note
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate City name" });
  }

  city.name = name;
  city.state=stateId;
  city.image =image;
  const updatedCity = await city.save();

  res.json(`'${updatedCity.name}' city  updated`);
};

// @desc Delete a city
// @route DELETE /city
// @access Private
const deleteCity = async (req, res) => {
  const { id } = req.body;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "City ID required" });
  }

  //check if this exist to jobs before deleting
  
  // Confirm city exists to delete
  const city = await City.findById(id).exec();

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
};
