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
  dateIsBeforeDate,
} = require("../../utils/helperFunctions");
const {
  Spot,
  User,
  SpotImage,
  Review,
  ReviewImage,
  Booking,
} = require("../../db/models");
const { Op } = require("sequelize");

const router = express.Router();

router.get("/", validateQuery, async (req, res) => {
  let { page, size, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } =
    req.query;
  const searchQuery = {};

  size = Number(size);
  if (!size || size > 20) {
    searchQuery.limit = 20;
    size = 20;
  } else searchQuery.limit = size;

  page = Number(page);
  if (!page) {
    searchQuery.offset = 0;
    page = 1;
  } else if (page > 10) {
    searchQuery.offset = 9 * searchQuery.limit;
    page = 10;
  } else {
    searchQuery.offset = (page - 1) * searchQuery.limit;
  }

  searchQuery.where = {};

  if (minLat || maxLat) searchQuery.where.lat = {};
  if (minLat) searchQuery.where.lat[Op.gt] = Number(minLat);
  if (maxLat) searchQuery.where.lat[Op.lt] = Number(maxLat);

  if (minLng || maxLng) searchQuery.where.lng = {};
  if (minLng) searchQuery.where.lng[Op.gt] = Number(minLng);
  if (maxLng) searchQuery.where.lng[Op.lt] = Number(maxLng);

  if (minPrice || maxPrice) searchQuery.where.price = {};
  if (minPrice) searchQuery.where.price[Op.gt] = Number(minPrice);
  if (maxPrice) searchQuery.where.price[Op.lt] = Number(maxPrice);

  let spots = await Spot.findAll(searchQuery);
  spots = JSON.parse(JSON.stringify(spots));

  const reviews = await Review.findAll({
    attributes: ["spotId", "stars"],
  });

  for (let i = 0; i < spots.length; i++) {
    spots[i].avgRating = getAvgRating(spots[i], reviews);
  }

  return res.status(200).json({ Spots: spots, page, size });
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

  for (let i = 0; i < spots.length; i++) {
    spots[i].avgRating = getAvgRating(spots[i], reviews);
  }

  return res.status(200).json({ Spots: spots });
});

router.get(
  "/:spotId",
  doesExist(Spot, "Spot", "spotId", {
    query: {
      include: [
        { model: SpotImage, attributes: ["id", "url", "preview"] },
        {
          model: User,
          attributes: ["id", "firstName", "lastName"],
          as: "Owner",
        },
      ],
      attributes: {
        exclude: ["previewImage"],
      },
    },
  }),
  async (req, res, next) => {
    const reviews = await req.Spot.getReviews({
      attributes: ["spotId", "stars"],
    });

    const spot = JSON.parse(JSON.stringify(req.Spot));

    spot.avgStarRating = getAvgRating(spot, reviews);
    spot.numReviews = reviews.length;

    return res.status(200).json(spot);
  }
);

router.post("/", requireAuth, validateSpot, async (req, res) => {
  const { address, city, state, country, lat, lng, name, description, price } =
    req.body;
    const newSpot = await Spot.create({
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

    return res.status(201).json({
      id: newSpot.id,
      ownerId: newSpot.ownerId,
      address: newSpot.address,
      city: newSpot.city,
      state: newSpot.state,
      country: newSpot.country,
      lat: newSpot.lat,
      lng: newSpot.lng,
      name: newSpot.name,
      description: newSpot.description,
      price: newSpot.price,
      createdAt: newSpot.createdAt,
      updatedAt: newSpot.updatedAt,
    });
});

router.put(
  "/:spotId",
  requireAuth,
  doesExist(Spot, "Spot", "spotId"),
  checkAuth({ model: "Spot", key: "ownerId", match: true }),
  validateSpot,
  async (req, res, next) => {
    const spot = req.Spot;

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

    const newSpot = await spot.update({
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

    return res.status(200).json({
      id: newSpot.id,
      ownerId: newSpot.ownerId,
      address: newSpot.address,
      city: newSpot.city,
      state: newSpot.state,
      country: newSpot.country,
      lat: newSpot.lat,
      lng: newSpot.lng,
      name: newSpot.name,
      description: newSpot.description,
      price: newSpot.price,
      createdAt: newSpot.createdAt,
      updatedAt: newSpot.updatedAt,
    });
  }
);

router.delete(
  "/:spotId",
  requireAuth,
  doesExist(Spot, "Spot", "spotId"),
  checkAuth({ model: "Spot", key: "ownerId", match: true }),
  async (req, res, next) => {
    const spot = req.Spot;

    await spot.destroy();
    return res.status(200).json({
      message: "Successfully deleted",
    });
  }
);

router.post(
  "/:spotId/images",
  requireAuth,
  doesExist(Spot, "Spot", "spotId"),
  checkAuth({ model: "Spot", key: "ownerId", match: true }),
  validateSpotImage,
  async (req, res, next) => {
    const spot = req.Spot;

    const { url, preview } = req.body;

    const spotImage = await spot.createSpotImage({
      spotId: req.params.spotId,
      url,
      preview,
    });

    if (preview === true) {
      spot.update({ previewImage: url });
    }

    res.status(200).json({
      id: spotImage.id,
      url: spotImage.url,
      preview: spotImage.preview,
    });
  }
);

router.get(
  "/:spotId/reviews",
  doesExist(Spot, "Spot", "spotId"),
  async (req, res) => {
    const reviews = await req.Spot.getReviews({
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
  doesExist(Spot, "Spot", "spotId"),
  validateReview,
  async (req, res, next) => {
    const spot = req.Spot;

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
  doesExist(Spot, "Spot", "spotId"),
  async (req, res) => {
    const spot = req.Spot;

    const query = {};

    if (req.user.id === spot.ownerId) {
      query.include = [
        {
          model: User,
          attributes: ["id", "firstName", "lastName"],
        },
      ];
    } else {
      query.attributes = ["spotId", "startDate", "endDate"];
    }

    const bookings = await spot.getBookings(query);

    return res.status(200).json({ Bookings: bookings });
  }
);

router.post(
  "/:spotId/bookings",
  requireAuth,
  doesExist(Spot, "Spot", "spotId"),
  checkAuth({ model: "Spot", key: "ownerId", match: false }),
  validateDate,
  noConflicts({ noSelfConflict: false }),
  async (req, res) => {
    const { startDate, endDate } = req.body;
    const newBooking = await req.Spot.createBooking({
      userId: req.user.id,
      startDate,
      endDate,
    });
    return res.status(200).json(newBooking);
  }
);

module.exports = router;
