const { ReviewImage } = require("../models");

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await ReviewImage.bulkCreate(
      [
        {
          reviewId: 1,
          url: "kitchenImage.url",
        },
        {
          reviewId: 1,
          url: "pilesOfGold.url",
        },
        {
          reviewId: 2,
          url: "bustedCouch.url",
        },
        {
          reviewId: 3,
          url: "largeRoundPizza.url",
        },
        {
          reviewId: 3,
          url: "anotherLargePizza.url",
        },
        {
          reviewId: 4,
          url: "statueOfMichaelImage.url",
        },
        {
          reviewId: 5,
          url: "pictureOfUnderpassWithoutCouch.url",
        },
        {
          reviewId: 6,
          url: "lovelyGreenField.url",
        },
        {
          reviewId: 6,
          url: "bonfire.url",
        },
        {
          reviewId: 6,
          url: "starySky.url",
        },
      ],
      { validate: true }
    );
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "ReviewImages";
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options);
  },
};
