const { validationResult } = require("express-validator");
const { Op } = require("sequelize");
const {
  dateIsBeforeDate,
  dateIsAfterDate,
  getToday,
} = require("./helperFunctions.js");

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

// //options...
// // {
// //   model: "spot"
// //   param:
// //   associated: {
//   model
//   function
// }
// // }

const doesExist = (model, modelName, param, options) => {
  return async (req, res, next) => {
    const numParam = Number(req.params[param]);
    if (!numParam || numParam % 1 !== 0) {
      res.status(400).json({
        message: `${param} isn't a valid integer`,
      });
    }

    if (!options) options = {};
    let { query, associated, missing } = options;
    if (!query) query = {};
    if (!missing) missing = modelName;
    query.where = {
      id: req.params[param],
    };

    req[modelName] = await model.findOne(query);
    if (!req[modelName]) {
      return res.status(404).json({
        message: `${missing} couldn't be found`,
      });
    }

    if (associated) {
      req[associated.modelName] = await associated.model.findOne({
        where: {
          id: req[modelName][associated.key],
        },
      });
    }

    return next();
  };
};

const checkAuth = (...options) => {
  return async (req, res, next) => {
    for (const option of options) {
      let { model, key, match } = option;
      if (
        (match && req.user.id === req[model][key]) ||
        (!match && req.user.id !== req[model][key])
      ) {
        return next();
      }
    }
    return res.status(403).json({
      message: "Forbidden",
    });
  };
};

const handleValidationErrors = (req, res, next) => {
  const validationErrors = validationResult(req);

  if (validationErrors.errors.length) {
    const err = {};
    err.message = "Bad request";
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
const noConflicts = (options) => {
  return async (req, res, next) => {
    let queryObj = {};
    if (req.Booking) {
      queryObj = {
        where: {
          id: {
            [Op.not]: req.Booking.id,
          },
        },
      };
    }
    const spot = req.Spot;

    const error = {
      message: "Sorry, this spot is already booked for the specified dates",
    };
    error.errors = {};
    let conflict = false;
    const bookings = await spot.getBookings(queryObj);
    for (const booking of bookings) {
      if (
        !dateIsBeforeDate(req.body.startDate, booking.startDate) &&
        !dateIsAfterDate(req.body.startDate, booking.endDate)
      ) {
        conflict = true;
        error.errors.startDate =
          "Start date conflicts with an existing booking";
      }
      if (
        !dateIsBeforeDate(req.body.endDate, booking.startDate) &&
        !dateIsAfterDate(req.body.endDate, booking.endDate)
      ) {
        conflict = true;
        error.errors.endDate = "End date conflicts with an existing booking";
      }
      if (
        dateIsBeforeDate(req.body.startDate, booking.startDate) &&
        dateIsAfterDate(req.body.endDate, booking.endDate)
      ) {
        conflict = true;
        error.errors.dates =
          "Start date and end date surround existing booking";
      }
    }
    if (conflict) {
      return res.status(403).json(error);
    }
    next();
  };
};

const isCurrent = (req, res, next) => {
  const booking = req.Booking;
  if (dateIsAfterDate(getToday(), booking.endDate)) {
    return res.status(403).json({
      message: "Past bookings can't be modified",
    });
  }
  next();
};

const notStarted = (req, res, next) => {
  if (!dateIsBeforeDate(getToday(), req.Booking.startDate)) {
    res.status(403).json({
      message: "Bookings that have been started can't be deleted",
    });
  }
  next();
};

const isPast = async (req, res, next) => {
  const booking = req.recordData;
  if ((dateIsBeforeDate(booking.endDate), getToday())) {
    res.status(403).json({
      message: "Past bookings can't be modified",
    });
  }
  next();
};

module.exports = {
  checkAuth,
  doesExist,
  handleValidationErrors,
  noConflicts,
  isCurrent,
  isPast,
  notStarted,
};
