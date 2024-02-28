"use strict";

const { Review } = require("../models");

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await Review.bulkCreate(
      [
        {
          userId: 3,
          spotId: 1,
          review: "There is nothing but caviar and gold flakes in the kitchen",
          stars: 2,
        },
        {
          userId: 3,
          spotId: 2,
          review:
            "I love people with loud cars and how much you can here them here",
          stars: 1,
        },
        {
          userId: 3,
          spotId: 3,
          review: "Nearby takeout was amazing",
          stars: 5,
        },
        {
          userId: 4,
          spotId: 1,
          review:
            "Why are there so many different pool in a boat on the ocean?",
          stars: 4,
        },
        {
          userId: 4,
          spotId: 2,
          review: "Someone stole the couch :c",
          stars: 1,
        },
        {
          userId: 4,
          spotId: 3,
          review: "Why does the name blue fit the color so well",
          stars: 4,
        },
        {
          userId: 5,
          spotId: 1,
          review: "Pirates tried to invade but the yacht is also a battleship",
          stars: 5,
        },
        {
          userId: 5,
          spotId: 3,
          review: "So good that were going to move to Colorado",
          stars: 4,
        },
      ],
      { validate: true }
    );
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "Reviews";
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options);
  },
};
