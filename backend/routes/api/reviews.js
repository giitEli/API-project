const express = require("express");
const bcrypt = require("bcryptjs");
const { check } = require("express-validator");
const {
  validateSignupBody,
  signupCustomValidator,
  validateQuery,
  validateSpot,
  validateDate,
  validateLogin,
  validateReview,
  validateReviewImage,
} = require("../../utils/validators");
const { requireAuth } = require("../../utils/auth");
const {
  checkAuth,
  doesExist,
  handleValidationErrors,
  noConflicts,
} = require("../../utils/middleWear");
const {
  Spot,
  User,
  SpotImage,
  Review,
  ReviewImage,
} = require("../../db/models");
const { getPreviewImage } = require("../../utils/helperFunctions");

const router = express.Router();

router.get("/", async (req, res) => {
  return res.json(await Spot.findAll());
});

router.get("/current", requireAuth, async (req, res, next) => {
  let reviews = await Review.findAll({
    where: {
      userId: req.user.id,
    },
    include: [
      { model: User, attributes: ["id", "firstName", "lastName"] },
      {
        model: Spot,
        attributes: { exclude: ["description", "createdAt", "updatedAt"] },
      },
      { model: ReviewImage, attributes: ["id", "url"] },
    ],
  });

  reviews = JSON.parse(JSON.stringify(reviews));

  const spotImages = await SpotImage.findAll({
    where: {
      preview: true,
    },
  });
  for (const review of reviews) {
    review.Spot.previewImage = getPreviewImage(review.Spot, spotImages);
  }

  res.json({ Reviews: reviews });
});

router.post(
  "/:reviewId/images",
  requireAuth,
  doesExist(Review, "reviewId", "Review"),
  checkAuth("userId"),
  validateReviewImage,
  async (req, res) => {
    const review = await Review.findByPk(req.params.reviewId);

    const currentAmountOfReviewImage = await review.countReviewImages();
    if (currentAmountOfReviewImage >= 10) {
      return res.status(403).json({
        message: "Maximum number of images for this resource was reached",
      });
    }

    const newReviewImage = await review.createReviewImage({
      url: req.body.url,
    });

    return res.status(200).json({
      id: newReviewImage.id,
      url: newReviewImage.url,
    });
  }
);

router.put(
  "/:reviewId",
  requireAuth,
  doesExist(Review, "reviewId", "Review"),
  checkAuth("userId"),
  validateReview,
  async (req, res, next) => {
    const reviewToUpdate = req.recordData;
    const { review, stars } = req.body;
    const updatedReview = await reviewToUpdate.update({ review, stars });

    return res.status(200).json(updatedReview);
  }
);

router.delete(
  "/:reviewId",
  requireAuth,
  doesExist(Review, "reviewId", "Review"),
  checkAuth("userId"),
  async (req, res, next) => {
    const review = req.recordData;

    await review.destroy();

    return res.json({
      message: "Successfully deleted",
    });
  }
);

module.exports = router;
