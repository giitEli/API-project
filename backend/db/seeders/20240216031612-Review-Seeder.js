"use strict";

const { Review } = require("../models");

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    // await Review.bulkCreate(
    //   [
    //     {
    //       userId: 3,
    //       spotId: 1,
    //       review: "Spot 1 was great",
    //       stars: 4,
    //     },
    //     {
    //       userId: 3,
    //       spotId: 2,
    //       review: "Spot 2 sucked :c",
    //       stars: 1,
    //     },
    //   ],
    //   { validate: true }
    // );
  },

  async down(queryInterface, Sequelize) {
  //   options.tableName = "Reviews";
  //   const Op = Sequelize.Op;
  //   return queryInterface.bulkDelete(options);
  },
};
