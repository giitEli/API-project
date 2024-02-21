// backend/routes/api/index.js
const router = require("express").Router();
const sessionRouter = require("./session.js");
const usersRouter = require("./users.js");
const spotsRouter = require("./spots.js");
const reviewRouter = require("./reviews.js");
const bookingRouter = require("./bookings");
const spotImageRouter = require("./spot-images");
const reviewImageRouter = require("./review-images");
const { restoreUser } = require("../../utils/auth.js");

// Connect restoreUser middleware to the API router
// If current user session is valid, set req.user to the user in the database
// If current user session is not valid, set req.user to null
router.use(restoreUser);

router.use("/session", sessionRouter);

router.use("/users", usersRouter);

router.use("/spots", spotsRouter);

router.use("/reviews", reviewRouter);

router.use("/bookings", bookingRouter);

router.use("/spot-images", spotImageRouter);

router.use("/review-images", reviewImageRouter);

module.exports = router;
