'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  // Polymorphic: commentable_type ('post'|'blog') + commentable_id.
  class Comment extends Model {
    static associate(models) {
      Comment.belongsTo(models.User, { foreignKey: 'user_id' });
      Comment.hasMany(models.Comment, { foreignKey: 'parent_id', as: 'replies' });
    }
  }
  Comment.init(
    {
      commentable_type: { type: DataTypes.STRING, allowNull: false },
      commentable_id: { type: DataTypes.INTEGER, allowNull: false },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      parent_id: { type: DataTypes.INTEGER },
      content: { type: DataTypes.TEXT, allowNull: false },
      is_approved: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      sequelize, modelName: 'Comment', tableName: 'comments',timestamps: false,
      indexes: [{ fields: ['commentable_type', 'commentable_id'] }],
    }
  );
  return Comment;
};
