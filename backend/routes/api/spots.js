const express = require("express");
const bcrypt = require("bcryptjs");
const { check, oneOf, query } = require("express-validator");
const {
  handleValidationErrors,
  dateIsBeforeDate,
  dateIsAfterDate,
  dateToString,
} = require("../../utils/validation");
const { setTokenCookie, requireAuth } = require("../../utils/auth");
const {
  Spot,
  User,
  SpotImage,
  Review,
  ReviewImage,
  Booking,
} = require("../../db/models");
const { INTEGER, Op } = require("sequelize");

const router = express.Router();

const validateQuery = [
  oneOf(
    [
      query("page").not().exists({ checkFalsy: false }),
      query("page").isInt({ min: 1 }),
    ],
    { message: "Page must be greater than or equal to 1" }
  ),
  oneOf(
    [
      query("size").not().exists({ checkFalsy: false }),
      query("size").isInt({ min: 1 }),
    ],
    { message: "Size must be greater than or equal to 1" }
  ),
  oneOf(
    [
      query("maxLat").not().exists({ checkFalsy: false }),
      query("maxLat").isFloat({ min: -90, max: 90 }),
    ],
    { message: "Maximum latitude is invalid" }
  ),
  oneOf(
    [
      query("minLat").not().exists({ checkFalsy: false }),
      query("minLat").isFloat({ min: -90, max: 90 }),
    ],
    { message: "Minimum latitude is invalid" }
  ),
  oneOf(
    [
      query("maxLng").not().exists({ checkFalsy: false }),
      query("maxLng").isFloat({ min: -180, max: 180 }),
    ],
    { message: "Maximum longitude is invalid" }
  ),
  oneOf(
    [
      query("minLng").not().exists({ checkFalsy: false }),
      query("minLng").isInt({ min: -180, max: 180 }),
    ],
    { message: "Minimum longitude is invalid" }
  ),
  oneOf(
    [
      query("maxPrice").not().exists({ checkFalsy: false }),
      query("maxPrice").isInt({ min: 0 }),
    ],
    { message: "Maximum price must be greater than or equal to 0" }
  ),
  oneOf(
    [
      query("minPrice").not().exists({ checkFalsy: false }),
      query("minPrice").isInt({ min: 0 }),
    ],
    { message: "Minimum price must be greater than or equal to 0" }
  ),
  handleValidationErrors,
];

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

  return res.json(await Spot.findAll());
});

router.get("/current", async (req, res) => {
  const spots = await Spot.findAll({
    where: {
      ownerId: req.user.id,
    },
  });
  return res.json(spots);
});

router.get("/:spotId", async (req, res, next) => {
  let spot = await Spot.findOne({
    where: {
      id: req.params.spotId,
    },
    include: [SpotImage, User],
  });
  if (!spot) {
    return res.json({
      message: "Spot couldn't be found",
    });
  }
  spot = await spot.toJSON();
  spot.Owner = spot.User;
  delete spot.User;
  delete spot.Owner.username;
  return res.json(spot);
});

const validateSpot = [
  check("address")
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage("Street address is required"),
  check("city")
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage("City is required"),
  check("state")
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage("State is required"),
  check("country")
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage("Country is required"),
  check("lat")
    .exists({ checkFalsy: true })
    .notEmpty()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be within -90 and 90"),
  check("lng")
    .exists({ checkFalsy: true })
    .notEmpty()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be within -180 and 180"),
  check("name")
    .exists({ checkFalsy: true })
    .notEmpty()
    .isLength({ max: 50 })
    .withMessage("Name must be less than 50 characters"),
  check("description")
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage("Description is required"),
  check("price")
    .notEmpty()
    .isInt({ min: 0 })
    .withMessage("Price per day must be a positive number"),
  handleValidationErrors,
];

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
  return res.json(newSpot);
});

router.put("/:spotId", requireAuth, validateSpot, async (req, res, next) => {
  const spot = await Spot.findByPk(req.params.spotId);

  if (!spot) {
    return res.json({
      message: "Spot couldn't be found",
    });
  }

  if (spot.ownerId !== req.user.id) {
    const err = new Error("Authentication required");
    err.title = "Authentication required";
    err.errors = { message: "Authentication required" };
    err.status = 401;
    return next(err);
  }
  const { address, city, state, country, lat, lng, name, description, price } =
    req.body;
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
  return res.json(spot);
});

router.delete("/:spotId", requireAuth, async (req, res, next) => {
  const spot = await Spot.findByPk(req.params.spotId);

  if (!spot) {
    return res.json({
      message: "Spot couldn't be found",
    });
  }

  if (spot.ownerId !== req.user.id) {
    const err = new Error("Authentication required");
    err.title = "Authentication required";
    err.errors = { message: "Authentication required" };
    err.status = 401;
    return next(err);
  }
  await spot.destroy();
  return res.json({
    message: "Successfully deleted",
  });
});

router.post("/:spotId/images", requireAuth, async (req, res, next) => {
  const spot = await Spot.findByPk(req.params.spotId);

  if (!spot) {
    return res.json({
      message: "Spot couldn't be found",
    });
  } else if (spot.ownerId !== req.user.id) {
    const err = new Error("Authentication required");
    err.title = "Authentication required";
    err.errors = { message: "Authentication required" };
    err.status = 401;
    return next(err);
  }

  const { url, preview } = req.body;

  const spotImage = await spot.createSpotImage({
    spotId: req.params.spotId,
    url,
    preview,
  });
  res.json(spotImage);
});

router.get("/:spotId/reviews", async (req, res) => {
  const reviews = await Review.findAll({
    where: {
      spotId: req.params.spotId,
    },
    include: [User, ReviewImage],
  });

  if (!reviews.length) {
    return res.json({
      message: "Spot couldn't be found",
    });
  }
  res.json(reviews);
});

const validateReview = [
  check("review")
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage("Review test is required"),
  check("stars")
    .exists({ checkFalsy: true })
    .notEmpty()
    .isInt({ min: 1, max: 5 })
    .withMessage("Stars must be an integer from 1 to 5"),
  handleValidationErrors,
];

router.post(
  "/:spotId/reviews",
  requireAuth,
  validateReview,
  async (req, res, next) => {
    const spot = await Spot.findByPk(req.params.spotId);

    if (!spot) {
      return res.json({
        message: "Spot couldn't be found",
      });
    }

    const doesUserAlreadyHaveReviewForSpot = await Review.findOne({
      where: {
        userId: req.user.id,
      },
    });

    if (doesUserAlreadyHaveReviewForSpot) {
      return res.json({
        message: "User already has a review for this spot",
      });
    }

    const { review, stars } = req.body;

    const newReview = await spot.createReview({
      userId: req.user.id,
      review,
      stars,
    });
    return res.json(newReview);
  }
);

router.get("/:spotId/bookings", requireAuth, async (req, res) => {
  const spot = await Spot.findByPk(req.params.spotId);

  if (!spot) {
    return res.json({
      message: "Spot couldn't be found",
    });
  } else if (spot.ownerId !== req.user.id) {
    const err = new Error("Authentication required");
    err.title = "Authentication required";
    err.errors = { message: "Authentication required" };
    err.status = 401;
    return next(err);
  }

  const bookings = await spot.getBookings({
    include: User,
  });
  return res.json(bookings);
});

const validateDate = [
  check("startDate")
    .custom((startDate) => {
      const today = dateToString(new Date());
      return dateIsBeforeDate(today, startDate);
    })
    .withMessage("startDate cannot be in the past"),
  check("endDate")
    .custom((endDate, { req }) => {
      return dateIsBeforeDate(req.body.startDate, endDate);
    })
    .withMessage("endDate cannot be on or before startDate"),
  handleValidationErrors,
];

const spotExist = async (req, res, next) => {
  req.spot = await Spot.findByPk(req.params.spotId);
  if (!req.spot) {
    return res.json({
      message: "Spot couldn't be found",
    });
  }
  next();
};

const userNotOwner = async (req, res, next) => {
  if (req.spot.ownerId === req.user.id) {
    return res.json({
      message: "User cannot be spot Owner",
    });
  }
  next();
};

const noConflicts = async (req, res, next) => {
  console.log("here");
  const spot = req.spot;
  const error = {
    message: "Sorry, this spot is already booked for the specified dates",
  };
  error.errors = {};
  let conflict = false;
  const bookings = await spot.getBookings();
  for (const booking of bookings) {
    if (
      !dateIsBeforeDate(req.body.startDate, dateToString(booking.startDate)) &&
      !dateIsAfterDate(req.body.startDate, dateToString(booking.endDate))
    ) {
      conflict = true;
      error.errors.startDate = "Start date conflicts with an existing booking";
    }
    if (
      !dateIsBeforeDate(req.body.endDate, dateToString(booking.startDate)) &&
      !dateIsAfterDate(req.body.endDate, dateToString(booking.endDate))
    ) {
      conflict = true;
      error.errors.endDate = "End date conflicts with an existing booking";
    }
  }
  if (conflict) {
    return res.json(error);
  }
  next();
};

router.post(
  "/:spotId/bookings",
  requireAuth,
  spotExist,
  userNotOwner,
  validateDate,
  noConflicts,
  async (req, res) => {
    const { startDate, endDate } = req.body;
    const newBooking = await Booking.create({
      spotId: req.params.spotId,
      userId: req.user.id,
      startDate,
      endDate,
    });
    return res.json(newBooking);
  }
);

module.exports = router;
