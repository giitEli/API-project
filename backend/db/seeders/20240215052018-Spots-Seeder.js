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
          address: "123 TrustFundMe Lane",
          city: "San Francisco",
          state: "California",
          country: "United States of America",
          lat: 80,
          lng: 7,
          name: "Michael's Yacht",
          description: "some would describe it a luxurious mobile campus",
          price: 999999,
          previewImage: "beautifulPreviewImage.url",
        },
        {
          ownerId: 1,
          address: "Under Overpass on 6th street",
          city: "Broke",
          state: "Maine",
          country: "United States of America",
          lat: 3,
          lng: -179,
          name: "Couch Under a Bridge!",
          description:
            "Someone dropped a couch under a bridge and I'm selling the spot",
          price: 2,
          previewImage: "couchImage.url",
        },
        {
          ownerId: 2,
          address: "1819 Water Lane",
          city: "Denver",
          state: "Colorado",
          country: "United States",
          lat: -72,
          lng: 164,
          name: "Cabin next to Suspicious farm",
          description: "Lovely cabin with lots of green Colorado Fun!",
          price: 9000,
          previewImage: "blazeBoxCabin.url",
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
        name: {
          [Op.in]: [
            "Michael's Yacht",
            "Couch Under a Bridge!",
            "Cabin next to Suspicious farm",
          ],
        },
      },
      {}
    );
  },
};
