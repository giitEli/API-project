const { check, oneOf, query, body } = require("express-validator");
const { handleValidationErrors } = require("./middleWear.js");
const { User } = require("../db/models");
const {
  dateIsBeforeDate,
  dateIsAfterDate,
  getAvgRating,
  getReviewCount,
  getPreviewImage,
  getToday,
  isDate,
} = require("./helperFunctions.js");
/*
flow:

requireAuth
doesExist - check is the thing exist
checkAuth - check to see if the logged in user has the correct authorization
validateBody validate the body of the request -
  handle body errors
validateExtra preform extra validations outside of validateBody scope -
  handle extra errors

preform action

*/

const validateSignupBody = [
  check("email").isEmail().withMessage("Invalid email"),
  check("username")
    .exists({ checkFalsy: true })
    .withMessage("Username is required"),
  // check("username")
  //   .isLength({ min: 4 })
  //   .withMessage("Please provide a username with at least 4 characters."),
  // check("username").not().isEmail().withMessage("Username cannot be an email."),
  check("firstName")
    .exists({ checkFalsy: true })
    .withMessage("First Name is required"),
  check("lastName")
    .exists({ checkFalsy: true })
    .withMessage("Last Name is required"),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be 6 characters or more."),
  handleValidationErrors,
];

const validateSpot = [
  check("address").notEmpty().withMessage("Street address is required"),
  check("city").notEmpty().withMessage("City is required"),
  check("state").notEmpty().withMessage("State is required"),
  check("country").notEmpty().withMessage("Country is required"),
  check("lat")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be within -90 and 90"),
  check("lng")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be within -180 and 180"),
  check("name")
    .exists({ checkFalsy: true })
    .custom((name) => {
      if (typeof name !== "string" || name.length > 50) return false;
      return true;
    })
    .withMessage("Name must be less than 50 characters"),
  check("description").notEmpty().withMessage("Description is required"),
  check("price")
    .isInt({ min: 0 })
    .withMessage("Price per day must be a positive number"),
  handleValidationErrors,
];

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

// check to see if signup body has email or username of existing user
const signupCustomValidator = async (req, res, next) => {
  const users = await User.findAll();
  let conflict = false;
  const err = { message: "User already exists", errors: {} };
  for (const user of users) {
    if (user.username === req.body.username) {
      conflict = true;
      err.errors.username = "User with that username already exists";
    }
    if (user.email === req.body.email) {
      conflict = true;
      err.errors.email = "User with that email already exists";
    }
  }
  if (conflict) {
    return res.status(500).json(err);
  }
  next();
};

const validateDate = [
  check("startDate")
    .custom((startDate) => isDate(startDate))
    .custom((startDate) => dateIsBeforeDate(getToday(), startDate))
    .withMessage("startDate cannot be in the past"),
  check("endDate")
    .custom((endDate) => isDate(endDate))
    .custom((endDate, { req }) => dateIsAfterDate(endDate, req.body.startDate))
    .withMessage("endDate cannot be on or before startDate"),
  handleValidationErrors,
];

const validateSpotImage = [
  check("url").isURL().withMessage("must be a valid url"),
  check("preview").isBoolean().withMessage("must be true of false"),
  handleValidationErrors,
];

const validateLogin = [
  check("credential").notEmpty().withMessage("Email or username is required"),
  check("password")
    .exists({ checkFalsy: true })
    .withMessage("Password is required"),
  handleValidationErrors,
];

const validateReview = [
  check("review").notEmpty().withMessage("Review text is required"),
  check("stars")
    .isInt({ min: 1, max: 5 })
    .withMessage("Stars must be an integer from 1 to 5"),
  handleValidationErrors,
];

const validateReviewImage = [
  check("url").isString().withMessage("must be a valid url"),
  handleValidationErrors,
];

module.exports = {
  validateSignupBody,
  signupCustomValidator,
  validateQuery,
  validateSpot,
  validateDate,
  validateLogin,
  validateReview,
  validateSpotImage,
  validateReviewImage,
};
