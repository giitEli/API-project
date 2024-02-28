"use strict";

const { Booking } = require("../models");

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await Booking.bulkCreate(
      [
        {
          spotId: 1,
          userId: 3,
          startDate: "2030-1-1",
          endDate: "2030-1-8",
        },
        {
          spotId: 2,
          userId: 3,
          startDate: "2030-2-1",
          endDate: "2030-2-8",
        },
        {
          spotId: 3,
          userId: 3,
          startDate: "2030-3-1",
          endDate: "2030-3-8",
        },
        {
          spotId: 1,
          userId: 4,
          startDate: "2040-1-1",
          endDate: "2040-1-8",
        },
        {
          spotId: 2,
          userId: 4,
          startDate: "2040-2-1",
          endDate: "2040-2-8",
        },
        {
          spotId: 3,
          userId: 4,
          startDate: "2040-3-1",
          endDate: "2040-3-8",
        },
        {
          spotId: 1,
          userId: 5,
          startDate: "2050-1-1",
          endDate: "2050-1-8",
        },
        {
          spotId: 3,
          userId: 5,
          startDate: "2050-2-1",
          endDate: "2050-2-8",
        },
        {
          spotId: 1,
          userId: 5,
          startDate: "2020-3-1",
          endDate: "2020-3-8",
        },
        {
          spotId: 3,
          userId: 5,
          startDate: "2020-4-1",
          endDate: "2020-4-8",
        },
      ],

      { validate: true }
    );
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "Bookings";
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options);
  },
};
