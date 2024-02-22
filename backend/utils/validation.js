// backend/utils/validation.js
const { validationResult } = require("express-validator");

// middleware for formatting errors from express-validator middleware
// (to customize, see express-validator's documentation)
const handleValidationErrors = (req, _res, next) => {
  const validationErrors = validationResult(req);

  console.log(validationErrors)

  if (!validationErrors.isEmpty()) {
    const errors = {};
    validationErrors
      .array()
      .forEach((error) => (errors[error.path] = error.msg));

    const err = Error("Bad request.");
    err.errors = errors;
    err.status = 400;
    err.title = "Bad request.";
    next(err);
  }
  next();
};

const dateIsBeforeDate = (date1, date2) => {
  const date1Arr = date1.split("-");
  const date2Arr = date2.split("-");
  for (let i = 0; i < 3; i++) {
    if (Number(date1Arr[i]) < Number(date2Arr[i])) return true;
    if (Number(date1Arr[i]) > Number(date2Arr[i])) return false;
  }
  if (date1 === date2) return false;
};

const dateIsAfterDate = (date1, date2) => {
  const date1Arr = date1.split("-");
  const date2Arr = date2.split("-");
  for (let i = 0; i < 3; i++) {
    if (Number(date1Arr[i]) > Number(date2Arr[i])) return true;
    if (Number(date1Arr[i]) < Number(date2Arr[i])) return false;
  }
  if (date1 === date2) return false;
};

const dateToString = (date) => {
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()].join("-");
};

module.exports = {
  dateToString,
  handleValidationErrors,
  dateIsBeforeDate,
  dateIsAfterDate,
};
