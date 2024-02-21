//make a function that creates the middle wear that checks if the user has the correct authorization

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

const doesExist = (model, reqParam, modelString) => {
  return async (req, res, next) => {
    req.recordData = await model.findByPk(req.params[reqParam]);

    if (!req.recordData) {
      return res.status(404).json({
        message: `${modelString} couldn't be found`,
      });
    }

    return next();
  };
};

module.exports = { checkAuth, doesExist };
