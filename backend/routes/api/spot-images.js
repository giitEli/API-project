const express = require("express");
const {
  checkAuth,
  doesExist,
  handleValidationErrors,
  noConflicts,
} = require("../../utils/middleWear.js");
const {
  validateSignupBody,
  signupCustomValidator,
  validateQuery,
  validateSpot,
  validateDate,
  validateLogin,
  validateReview,
} = require("../../utils/validators");
const {
  dateToString,
  dateIsBeforeDate,
  dateIsAfterDate,
} = require("../../utils/helperFunctions");
const { requireAuth } = require("../../utils/auth");
const {
  Spot,
  User,
  SpotImage,
  Review,
  ReviewImage,
  Booking,
} = require("../../db/models");

const router = express.Router();

const userIsOwner = async (req, res, next) => {
  const spot = await req.recordData.getSpot();
  if (spot.ownerId !== req.user.id) {
    return res.status(403).json({
      message: "Forbidden",
    });
  }
  next();
};

router.delete(
  "/:imageId",
  requireAuth,
  doesExist(SpotImage, "SpotImage", "imageId", {
    missing: "Spot Image",
    associated: { model: Spot, modelName: "Spot", key: "spotId" },
  }),
  checkAuth({ model: "Spot", key: "ownerId", match: "true" }),
  async (req, res) => {
    await req.SpotImage.destroy();
    const spot = req.Spot;
    await spot.update({
      previewImage: null,
    });
    return res.status(200).json({
      message: "Successfully deleted",
    });
  }
);

module.exports = router;
