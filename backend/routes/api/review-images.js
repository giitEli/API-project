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
  req.reviewImage = await ReviewImage.findByPk(req.params.imageId);
  if (!req.reviewImage) {
    return res.json({
      message: "Review Image couldn't be found",
    });
  }
  next();
};

const userOwnsReview = async (req, res, next) => {
  const review = await req.reviewImage.getReview();
  if (review.userId !== req.user.id) {
    return res.json({
      message: "Your are not the owner of this review",
    });
  }
  next();
};

router.delete(
  "/:imageId",
  requireAuth,
  imageExist,
  userOwnsReview,
  async (req, res) => {
    await req.reviewImage.destroy();
    return res.json({
      message: "Successfully deleted",
    });
  }
);

module.exports = router;
