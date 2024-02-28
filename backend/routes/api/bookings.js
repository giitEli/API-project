const express = require("express");
const {
  checkAuth,
  doesExist,
  handleValidationErrors,
  noConflicts,
  isCurrent,
  isPast,
  notStarted,
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
  getToday,
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

router.get("/current", requireAuth, async (req, res) => {
  const bookings = await Booking.findAll({
    where: {
      userId: req.user.id,
    },
    include: [
      {
        model: Spot,
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      },
    ],
  });
  return res.json({ Bookings: bookings });
});

router.put(
  "/:bookingId",
  requireAuth,
  doesExist(Booking, "Booking", "bookingId", {
    associated: {
      model: Spot,
      modelName: "Spot",
      key: "spotId",
    },
  }),
  checkAuth({ model: "Booking", key: "userId", match: true }),
  validateDate,
  isCurrent,
  noConflicts(),
  async (req, res) => {
    const { startDate, endDate } = req.body;
    const updateBooking = await req.Booking.update({
      startDate,
      endDate,
    });
    return res.json(updateBooking);
  }
);

router.delete(
  "/:bookingId",
  requireAuth,
  doesExist(Booking, "Booking", "bookingId", {
    associated: {
      model: Spot,
      modelName: "Spot",
      key: "spotId",
    },
  }),
  checkAuth(
    { model: "Booking", key: "userId", match: true },
    { model: "Spot", key: "ownerId", match: true }
  ),
  notStarted,
  async (req, res) => {
    await req.Booking.destroy();
    res.status(200).json({
      message: "Successfully deleted",
    });
  }
);

module.exports = router;
