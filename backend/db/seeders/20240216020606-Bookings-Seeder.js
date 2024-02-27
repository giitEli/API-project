"use strict";

const { Booking } = require("../models");

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    // await Booking.bulkCreate(
    //   [
    //     {
    //       spotId: 1,
    //       userId: 3,
    //       startDate: "2030-1-1",
    //       endDate: "2031-1-1",
    //     },
    //     {
    //       spotId: 1,
    //       userId: 3,
    //       startDate: "2010-1-1",
    //       endDate: "2011-1-1",
    //     },
    //     {
    //       spotId: 2,
    //       userId: 3,
    //       startDate: "2030-1-1",
    //       endDate: "2031-1-1",
    //     },
    //   ],

    //   { validate: true }
    // );
  },

  async down(queryInterface, Sequelize) {
    // options.tableName = "Bookings";
    // const Op = Sequelize.Op;
    // return queryInterface.bulkDelete(options);
  },
};
