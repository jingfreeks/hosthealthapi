const express = require("express");
const router = express.Router();
const citiesController = require("../controllers/cityController");
const verifyJWT = require("../middleware/verifyJWT");

// Middleware to verify JWT for all /city routes
router.use(verifyJWT);

// @route GET /city - Get all cities
// @route POST /city - Create new city
// @route PATCH /city - Update a city
// @route DELETE /city - Delete a city
router
  .route("/")
  .get(citiesController.getAllCities)
  .post(citiesController.createNewCities)
  .patch(citiesController.updateCity)
  .delete(citiesController.deleteCity);

// @route GET /city/:cityId - Get cities by jobs
router.route("/:cityId").get(citiesController.getCitiesByJobs);

module.exports = router;
