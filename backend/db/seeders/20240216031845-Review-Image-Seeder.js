const { Review_Image } = require("../models");

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await Review_Image.bulkCreate(
      [
        {
          reviewId: 1,
          url: "image url",
        },
      ],
      { validate: true }
    );
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "Review_Images";
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options);
  },
};
