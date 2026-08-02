'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Blog extends Model {
    static associate(models) {
      Blog.belongsTo(models.BlogCategory, { foreignKey: 'category_id' });
      Blog.belongsTo(models.User, { foreignKey: 'author_id', as: 'author' });
      Blog.hasMany(models.Comment, {
        foreignKey: 'commentable_id', constraints: false, scope: { commentable_type: 'blog' }, as: 'comments',
      });
      Blog.hasMany(models.Like, {
        foreignKey: 'likeable_id', constraints: false, scope: { likeable_type: 'blog' }, as: 'likes',
      });
    }
  }
  Blog.init(
    {
      title: { type: DataTypes.STRING, allowNull: false },
      slug: { type: DataTypes.STRING, allowNull: false, unique: true },
      short_description: { type: DataTypes.TEXT },
      content: { type: DataTypes.TEXT('long') },
      thumbnail: { type: DataTypes.STRING },
      gallery: { type: DataTypes.JSON },
      category_id: { type: DataTypes.INTEGER },
      author_id: { type: DataTypes.INTEGER },
      tags: { type: DataTypes.STRING },
      meta_title: { type: DataTypes.STRING },
      meta_keywords: { type: DataTypes.TEXT },
      meta_description: { type: DataTypes.TEXT },
      noindex: { type: DataTypes.BOOLEAN, defaultValue: false },
      nofollow: { type: DataTypes.BOOLEAN, defaultValue: false },
      canonical_url: { type: DataTypes.STRING },
      views: { type: DataTypes.INTEGER, defaultValue: 0 },
      word_count: { type: DataTypes.INTEGER, defaultValue: 0 },
      // auto-computed from word_count in the service layer if not supplied
      read_time: { type: DataTypes.INTEGER, defaultValue: 0 },
      is_featured: { type: DataTypes.BOOLEAN, defaultValue: false },
      status: { type: DataTypes.STRING(20), defaultValue: 'draft' }, // draft | published
      published_at: { type: DataTypes.DATE },
      // new, per user's request
      likes_count: { type: DataTypes.INTEGER, defaultValue: 0 },
      comments_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    { sequelize, modelName: 'Blog', tableName: 'blogs', paranoid: true }
  );
  return Blog;
};
