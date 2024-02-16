const { Spot_Image } = require("../models");

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await Spot_Image.bulkCreate(
      [
        {
          spotId: 1,
          url: "image url",
          preview: true,
        },
        {
          spotId: 1,
          url: "image url",
          preview: false,
        },
      ],
      { validate: true }
    );
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "Spot_Images";
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options);
  },
};
