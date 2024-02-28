"use strict";

const { User } = require("../models");
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await User.bulkCreate(
      [
        {
          email: "spotOwnerOne@mail.com",
          firstName: "Bob",
          lastName: "Boberson",
          username: "BigOwner1",
          hashedPassword: bcrypt.hashSync("password"),
        },
        {
          email: "spotOwnerTwo@mail.com",
          firstName: "Phil",
          lastName: "Philupson",
          username: "LargeOwnerTwo",
          hashedPassword: bcrypt.hashSync("password"),
        },
        {
          email: "reviewerOne@mail.com",
          firstName: "Elie",
          lastName: "Elieson",
          username: "realReviewsOne",
          hashedPassword: bcrypt.hashSync("password"),
        },
        {
          email: "raterTwo@mail.com",
          firstName: "Frank",
          lastName: "Franklinson",
          username: "garbageRater2",
          hashedPassword: bcrypt.hashSync("password"),
        },
        {
          email: "ultimateBooker@mail.com",
          firstName: "Brook",
          lastName: "Brookbookbookerson",
          username: "alwaysOnVacation",
          hashedPassword: bcrypt.hashSync("password"),
        },
      ],
      { validate: true }
    );
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "Users";
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(
      options,
      {
        username: {
          [Op.in]: [
            "BigOwner1",
            "LargeOwnerTwo",
            "realReviewsOne",
            "garbageRater2",
            "alwaysOnVacation",
          ],
        },
      },
      {}
    );
  },
};
