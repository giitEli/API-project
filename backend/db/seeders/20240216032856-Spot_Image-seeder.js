const { SpotImage } = require("../models");

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await SpotImage.bulkCreate(
      [
        {
          spotId: 1,
          url: "beautifulPreviewImage.url",
          preview: true,
        },
        {
          spotId: 1,
          url: "goldPile.url",
          preview: false,
        },
        {
          spotId: 2,
          url: "couchImage.url",
          preview: true,
        },
        {
          spotId: 2,
          url: "scuffedBridgePhoto.url",
          preview: false,
        },
        {
          spotId: 3,
          url: "blazeBoxCabin.url",
          preview: true,
        },
        {
          spotId: 3,
          url: "snoopDogNextToCabin.url",
          preview: false,
        },
      ],
      { validate: true }
    );
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "SpotImages";
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete({
      url: {
        [Op.in]: [
          "beautifulPreviewImage.url",
          "goldPile.url",
          "couchImage.url",
          "scuffedBridgePhoto.url",
          "blazeBoxCabin.url",
          "snoopDogNextToCabin.url",
        ],
      },
    });
  },
};
