const express = require("express");
const bcrypt = require("bcryptjs");
const { check } = require("express-validator");
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

const router = express.Router();

router.get("/current", requireAuth, async (req, res) => {
  const bookings = await Booking.findAll({
    where: {
      userId: req.user.id,
      include: [Spot],
    },
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

const noConflicts = async (req, res, next) => {
  console.log("here");
  const spot = await Spot.findByPk(req.booking.spotId);
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

const bookingExist = async (req, res, next) => {
  req.booking = await Booking.findByPk(req.params.bookingId);
  if (!req.booking) {
    return res.json({
      message: "Booking couldn't be found",
    });
  }
  next();
};

const correctAuth = async (req, res, next) => {
  if (req.user.id !== req.booking.userId) {
    return res.json({
      message: "correct authorization required",
    });
  }
  next();
};

const isCurrentBooking = async (req, res, next) => {
  const today = dateToString(new Date());
  const bookingEndDate = dateToString(req.booking.endDate);
  if (dateIsAfterDate(today, bookingEndDate)) {
    return res.json({
      message: "Past bookings can't be modified",
    });
  }
  next();
};

const belongToOwnerOrUser = async (req, res, next) => {
  const spot = await Spot.findByPk(req.booking.spotId);
  if (req.booking.userId !== req.user.id && spot.ownerId !== req.user.id) {
    return res.json({
      message: "Only User or Owner can delete booking",
    });
  }
  next();
};

const notPast = async (req, res, next) => {
  if (
    dateIsAfterDate(
      dateToString(new Date()),
      dateToString(req.booking.startDate)
    )
  ) {
    return res.json({
      message: "Bookings that have been started can't be deleted",
    });
  }
  next();
};

router.put(
  "/:bookingId",
  requireAuth,
  bookingExist,
  correctAuth,
  validateDate,
  isCurrentBooking,
  noConflicts,
  async (req, res) => {
    const { startDate, endDate } = req.body;
    const updateBooking = await req.booking.update({
      startDate,
      endDate,
    });
    return res.json(updateBooking);
  }
);

router.delete(
  "/:bookingId",
  requireAuth,
  bookingExist,
  belongToOwnerOrUser,
  notPast,
  async (req, res) => {
    await req.booking.destroy();
    res.json({
      message: "Successfully deleted",
    });
  }
);

module.exports = router;
