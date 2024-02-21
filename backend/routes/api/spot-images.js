const express = require("express");
const bcrypt = require("bcryptjs");
const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");
const { setTokenCookie, requireAuth } = require("../../utils/auth");
const { checkAuth, doesExist } = require("../../utils/middleHelpers");
const {
  Spot,
  User,
  SpotImage,
  Review,
  ReviewImage,
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
