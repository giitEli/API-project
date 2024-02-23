const express = require("express");
const {
  validateSignupBody,
  signupCustomValidator,
  validateQuery,
  validateSpot,
  validateDate,
  validateLogin,
  validateReview,
  validateSpotImage,
} = require("../../utils/validators");
const {
  checkAuth,
  doesExist,
  handleValidationErrors,
  noConflicts,
} = require("../../utils/middleWear");
const { requireAuth } = require("../../utils/auth");
const {
  getAvgRating,
  getReviewCount,
  getPreviewImage,
} = require("../../utils/helperFunctions");
const {
  Spot,
  User,
  SpotImage,
  Review,
  ReviewImage,
  Booking,
} = require("../../db/models");
const { INTEGER, Op } = require("sequelize");

const updateSpotAvgRating = async (spot, reviews, newReviewStars) => {
  const avgRating = parseInt(
    (reviews.reduce((acc, review) => (acc += Number(review.stars)), 0) +
      Number(newReviewStars)) /
      (reviews.length + 1)
  );
  await spot.update({
    avgRating,
  });
};

const router = express.Router();

router.get("/", validateQuery, async (req, res) => {
  const searchQuery = {};
  searchQuery.where = {};

  if (!req.query.size || Number(req.query.size > 20)) {
    searchQuery.limit = 20;
  } else searchQuery.limit = Number(req.query.size);

  if (!req.query.page) {
    searchQuery.offset = 0;
  } else if (Number(page.query.page > 10)) {
    searchQuery.offset = 9 * searchQuery.limit;
  } else searchQuery.offset = (Number(req.query.size) - 1) * searchQuery.limit;

  const { minLat, maxLat, minLng, maxLng, minPrice, maxPrice } = req.query;

  if (minLat || maxLat) searchQuery.where.lat = {};
  if (minLat) searchQuery.where.lat[Op.gt] = Number(minLat);
  if (maxLat) searchQuery.where.lat[Op.lt] = Number(maxLat);

  if (minLng || maxLng) searchQuery.where.lng = {};
  if (minLng) searchQuery.where.lng[Op.gt] = Number(minLng);
  if (maxLng) searchQuery.where.lng[Op.lt] = Number(maxLng);

  if (minPrice || maxPrice) searchQuery.where.price = {};
  if (minPrice) searchQuery.where.price[Op.gt] = Number(minPrice);
  if (maxPrice) searchQuery.where.price[Op.lt] = Number(maxPrice);

  let spots = await Spot.findAll();
  spots = JSON.parse(JSON.stringify(spots));

  const reviews = await Review.findAll({
    attributes: ["spotId", "stars"],
  });
  const spotImages = await SpotImage.findAll({
    attributes: ["spotId", "url", "preview"],
  });

  for (let i = 0; i < spots.length; i++) {
    spots[i].avgRating = getAvgRating(spots[i], reviews);
    spots[i].previewImage = getPreviewImage(spots[i], spotImages);
  }

  return res.status(200).json({ Spots: spots });
});

router.get("/current", requireAuth, async (req, res) => {
  let spots = await Spot.findAll({
    where: {
      ownerId: req.user.id,
    },
  });
  spots = JSON.parse(JSON.stringify(spots));

  const reviews = await Review.findAll({
    attributes: ["spotId", "stars"],
  });
  const spotImages = await SpotImage.findAll({
    attributes: ["spotId", "url", "preview"],
  });

  for (let i = 0; i < spots.length; i++) {
    spots[i].avgRating = getAvgRating(spots[i], reviews);
    spots[i].previewImage = getPreviewImage(spots[i], spotImages);
  }

  return res.status(200).json({ Spots: spots });
});

router.get(
  "/:spotId",
  doesExist(Spot, "spotId", "Spot", {
    include: [
      { model: SpotImage, attributes: ["id", "url", "preview"] },
      {
        model: User,
        attributes: ["id", "firstName", "lastName"],
        as: "Owner",
      },
    ],
  }),
  async (req, res, next) => {
    let spot = req.recordData;

    spot = JSON.parse(JSON.stringify(spot));

    const reviews = await Review.findAll({
      attributes: ["spotId", "stars"],
    });
    spot.avgStarRating = getAvgRating(spot, reviews);

    return res.status(200).json(spot);
  }
);

router.post("/", requireAuth, validateSpot, async (req, res) => {
  const { address, city, state, country, lat, lng, name, description, price } =
    req.body;
  const newSpot = await Spot.create({
    ownerId: req.user.id,
    address,
    city,
    state,
    country,
    lat,
    lng,
    name,
    description,
    price,
  });
  return res.status(201).json(newSpot);
});

router.put(
  "/:spotId",
  requireAuth,
  doesExist(Spot, "spotId", "Spot"),
  checkAuth("ownerId"),
  validateSpot,
  async (req, res, next) => {
    const spot = req.recordData;

    const {
      address,
      city,
      state,
      country,
      lat,
      lng,
      name,
      description,
      price,
    } = req.body;

    await spot.update({
      address,
      city,
      state,
      country,
      lat,
      lng,
      name,
      description,
      price,
    });

    return res.status(200).json(spot);
  }
);

router.delete(
  "/:spotId",
  requireAuth,
  doesExist(Spot, "spotId", "Spot"),
  checkAuth("ownerId"),
  async (req, res, next) => {
    const spot = req.recordData;

    await spot.destroy();
    return res.status(200).json({
      message: "Successfully deleted",
    });
  }
);

router.post(
  "/:spotId/images",
  requireAuth,
  doesExist(Spot, "spotId", "Spot"),
  checkAuth("ownerId"),
  validateSpotImage,
  async (req, res, next) => {
    const spot = req.recordData;

    const { url, preview } = req.body;

    const spotImage = await spot.createSpotImage({
      spotId: req.params.spotId,
      url,
      preview,
    });

    res.status(200).json({
      id: spotImage.id,
      url: spotImage.url,
      preview: spotImage.preview,
    });
  }
);

router.get(
  "/:spotId/reviews",
  doesExist(Spot, "spotId", "Spot"),
  async (req, res) => {
    const reviews = await req.recordData.getReviews({
      where: {
        spotId: req.params.spotId,
      },
      include: [
        { model: User, attributes: ["id", "firstName", "lastName"] },
        { model: ReviewImage, attributes: ["id", "url"] },
      ],
    });

    res.status(200).json({ Reviews: reviews });
  }
);

router.post(
  "/:spotId/reviews",
  requireAuth,
  doesExist(Spot, "spotId", "Spot"),
  validateReview,
  async (req, res, next) => {
    const spot = req.recordData;

    const reviews = await spot.getReviews();

    for (let review of reviews) {
      if (review.userId === req.user.id) {
        return res.status(500).json({
          message: "User already has a review for this spot",
        });
      }
    }

    const { review, stars } = req.body;

    const newReview = await spot.createReview({
      userId: req.user.id,
      review,
      stars,
    });

    return res.status(201).json(newReview);
  }
);

router.get(
  "/:spotId/bookings",
  requireAuth,
  doesExist(Spot, "spotId", "Spot"),
  checkAuth("ownerId"),
  async (req, res) => {
    const spot = req.recordData;

    const bookings = await spot.getBookings({
      include: User,
    });
    return res.json(bookings);
  }
);

router.post(
  "/:spotId/bookings",
  requireAuth,
  doesExist(Spot, "spotId", "Spot"),
  checkAuth("ownerId", true),
  validateDate,
  noConflicts,
  async (req, res) => {
    const { startDate, endDate } = req.body;
    const spot = req.recordData;
    const newBooking = await spot.createBooking({
      userId: req.user.id,
      startDate,
      endDate,
    });
    return res.status(201).json(newBooking);
  }
);

module.exports = router;
