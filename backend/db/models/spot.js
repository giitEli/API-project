"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Spot extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Spot.hasMany(models.Review, {
        foreignKey: "spotId",
      });
      Spot.belongsTo(models.User, {
        foreignKey: "ownerId",
        as: "Owner",
      });
      Spot.hasMany(models.SpotImage, {
        foreignKey: "spotId",
      });
      Spot.hasMany(models.Booking, {
        foreignKey: "spotId",
      });
    }
  }
  Spot.init(
    {
      ownerId: DataTypes.INTEGER,
      address: DataTypes.STRING,
      city: DataTypes.STRING,
      state: DataTypes.STRING,
      country: DataTypes.STRING,
      lat: DataTypes.FLOAT,
      lng: DataTypes.FLOAT,
      name: DataTypes.STRING,
      description: DataTypes.STRING,
      price: DataTypes.INTEGER,
      previewImage: {
        type: DataTypes.STRING,
        defaultValue: null,
      },
    },
    {
      sequelize,
      modelName: "Spot",
    }
  );
  return Spot;
};
