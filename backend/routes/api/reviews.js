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

router.get("/", async (req, res) => {
  return res.json(await Spot.findAll());
});

router.get("/current", requireAuth, async (req, res, next) => {
  const reviews = await Review.findAll({
    where: {
      userId: req.user.id,
    },
    include: [User, Spot, ReviewImage],
  });
  res.json(reviews);
});

router.post("/:reviewId/images", requireAuth, async (req, res) => {
  const review = await Review.findByPk(req.params.reviewId);
  if (!review) {
    return res.json({ message: "Review couldn't be found" });
  }

  if (review.userId !== req.user.id) {
    const err = new Error("Authentication required");
    err.title = "Authentication required";
    err.errors = { message: "Authentication required" };
    err.status = 401;
    return next(err);
  }

  const currentAmountOfReviewImage = await review.countReviewImages();
  if (currentAmountOfReviewImage >= 10) {
    return res.json({
      message: "Maximum number of images for this resource was reached",
    });
  }
  const newReviewImage = await review.createReviewImage({
    url: req.body.url,
  });
  return res.json(newReviewImage);
});

const validateReview = [
  check("review")
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage("Review text is required"),
  check("stars")
    .exists({ checkFalsy: true })
    .notEmpty()
    .isInt({ min: 1, max: 5 })
    .withMessage("Stars must be an integer from 1 to 5"),
  handleValidationErrors,
];

router.put(
  "/:reviewId",
  requireAuth,
  validateReview,
  async (req, res, next) => {
    const reviewToUpdate = await Review.findByPk(req.params.reviewId);
    if (!reviewToUpdate) {
      return res.json({ message: "Review couldn't be found" });
    }

    if (reviewToUpdate.userId !== req.user.id) {
      const err = new Error("Authentication required");
      err.title = "Authentication required";
      err.errors = { message: "Authentication required" };
      err.status = 401;
      return next(err);
    }
    const { review, stars } = req.body;
    const updatedReview = await reviewToUpdate.update({ review, stars });
    return res.json(updatedReview);
  }
);

router.delete("/:reviewId", requireAuth, async (req, res, next) => {
  const review = await Review.findByPk(req.params.reviewId);
  if (!review) {
    return res.json({ message: "Review couldn't be found" });
  }

  if (review.userId !== req.user.id) {
    const err = new Error("Authentication required");
    err.title = "Authentication required";
    err.errors = { message: "Authentication required" };
    err.status = 401;
    return next(err);
  }
  await review.destroy();
  return res.json({
    message: "Successfully deleted",
  });
});

module.exports = router;
