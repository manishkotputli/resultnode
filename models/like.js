'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  // Polymorphic: likeable_type ('post'|'blog') + likeable_id.
  class Like extends Model {
    static associate(models) {
      Like.belongsTo(models.User, { foreignKey: 'user_id' });
    }
  }
  Like.init(
    {
      likeable_type: { type: DataTypes.STRING, allowNull: false },
      likeable_id: { type: DataTypes.INTEGER, allowNull: false },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      sequelize, modelName: 'Like', tableName: 'likes',timestamps: false,
      indexes: [{ unique: true, fields: ['likeable_type', 'likeable_id', 'user_id'] }],
    }
  );
  return Like;
};
