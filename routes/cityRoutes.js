const express = require("express");
const router = express.Router();
const citiesController = require("../controllers/cityController");
const verifyJWT = require("../middleware/verifyJWT");

router.use(verifyJWT);
router
  .route("/")
  .get(citiesController.getAllCities)
  .post(citiesController.createNewCities)
  .patch(citiesController.updateCity)
  .delete(citiesController.deleteCity);

router.route("/:cityId").get(citiesController.getCitiesByJobs);
module.exports = router;
