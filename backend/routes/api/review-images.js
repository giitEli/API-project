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
  (req, res, next) => {
    next()
  },
  requireAuth,
  doesExist(ReviewImage, "ReviewImage", "imageId", {
    missing: "Review Image",
    associated: {
      modelName: "Review",
      model: Review,
      key: "reviewId"
    },
  }),
  checkAuth({ model: "Review", key: "userId", match: true }),
  async (req, res) => {
    await req.ReviewImage.destroy();
    return res.status(200).json({
      message: "Successfully deleted",
    });
  }
);

module.exports = router;
