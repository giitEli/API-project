"use strict";

const { Spot } = require("../models");

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await Spot.bulkCreate(
      [
        {
          ownerId: 1,
          address: "123 Disney Lane",
          city: "San Francisco",
          state: "California",
          country: "United States of America",
          lat: 37.7645358,
          lng: -122.4730327,
          name: "App Academy",
          description: "Place where web developers are created",
          price: 123,
        },
        {
          ownerId: 1,
          address: "123 All Eyes On Me",
          city: "City of Sin",
          state: "ShingtonWa",
          country: "United States of America",
          lat: 36.7645358,
          lng: -222.4730327,
          name: "Good Spot",
          description: "fake place in my mind",
          price: 999,
        },
        {
          ownerId: 2,
          address: "123 fake address",
          city: "Fake City",
          state: "Fake State",
          country: "Fake Country",
          lat: 69,
          lng: -69,
          name: "Fake Place",
          description: "Fake description for a fake place",
          price: 9000,
        },
      ],
      { validate: true }
    );
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "Spots";
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(
      options,
      {
        name: { [Op.in]: ["App Academy", "Good Spot", "Fake Place"] },
      },
      {}
    );
  },
};
