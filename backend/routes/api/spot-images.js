const express = require("express");
const bcrypt = require("bcryptjs");
const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");
const { setTokenCookie, requireAuth } = require("../../utils/auth");
const {
  Spot,
  User,
  SpotImage,
  Review,
  ReviewImage,
} = require("../../db/models");

const router = express.Router();

const imageExist = async (req, res, next) => {
  req.spotImage = await SpotImage.findByPk(req.params.imageId);
  if (!req.spotImage) {
    return res.json({
      message: "Spot Image couldn't be found",
    });
  }
  next();
};

const userIsOwner = async (req, res, next) => {
  const spot = await req.spotImage.getSpot();
  if (spot.ownerId !== req.user.id) {
    return res.json({
      message: "Your are not the owner of this spot",
    });
  }
  next();
};

router.delete(
  "/:imageId",
  requireAuth,
  imageExist,
  userIsOwner,
  async (req, res) => {
    await req.spotImage.destroy();
    return res.json({
      message: "Successfully deleted",
    });
  }
);

module.exports = router;
