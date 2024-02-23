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
} = require("../../utils/helperFunctions")
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
  doesExist(SpotImage, "imageId", "Spot Image"),
  userIsOwner,
  async (req, res) => {
    await req.recordData.destroy();
    return res.json({
      message: "Successfully deleted",
    });
  }
);

module.exports = router;
