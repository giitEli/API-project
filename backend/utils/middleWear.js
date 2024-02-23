const { validationResult } = require("express-validator");

const {
  Spot,
  User,
  SpotImage,
  Review,
  ReviewImage,
  Booking,
} = require("../db/models");

//user must be logged in
//req must have record inside of it and record must exist

const checkAuth = (key, notMatch) => {
  return async (req, res, next) => {
    const forbiddenMessage = {
      message: "Forbidden",
    };

    if (notMatch && req.user.id === req.recordData[key]) {
      return res.status(403).json(forbiddenMessage);
    } else if (!notMatch && req.user.id !== req.recordData[key]) {
      return res.status(403).json(forbiddenMessage);
    }

    next();
  };
};

const doesExist = (model, reqParam, errorString, selectorObj) => {
  return async (req, res, next) => {
    if (!selectorObj) selectorObj = {};
    selectorObj.where = {
      id: req.params[reqParam],
    };
    req.recordData = await model.findOne(selectorObj);

    if (!req.recordData) {
      return res.status(404).json({
        message: `${errorString} couldn't be found`,
      });
    }

    return next();
  };
};

const handleValidationErrors = (req, res, next) => {
  const validationErrors = validationResult(req);

  if (validationErrors.errors.length) {
    const err = {};
    err.message = "Bad request";
    console.log(validationErrors.errors);
    err.errors = {};
    for (let validationError of validationErrors.errors) {
      err.errors[validationError.path] = validationError.msg;
    }
    return res.status(400).json(err);
  }

  next();
  // old code
  // if (!validationErrors.isEmpty()) {
  //   const errors = {};
  //   validationErrors
  //     .array()
  //     .forEach((error) => (errors[error.path] = error.msg));

  //   const err = Error("Bad request.");
  //   err.errors = errors;
  //   err.status = 400;
  //   err.title = "Bad request.";
  //   next(err);
  // }
};

const noConflicts = async (req, res, next) => {
  const spot = req.recordData;
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

module.exports = { checkAuth, doesExist, handleValidationErrors, noConflicts };
