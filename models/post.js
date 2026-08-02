'use strict';
const { Model } = require('sequelize');

function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    static associate(models) {
      Post.belongsTo(models.Category, { foreignKey: 'category_id' });
      Post.hasMany(models.PostLink, { foreignKey: 'post_id', as: 'links' });
      // DynamicField is generic (table_name/record_id), not a real FK -
      // this association is a convenience for eager-loading in queries only.
      Post.hasMany(models.DynamicField, {
        foreignKey: 'record_id',
        constraints: false,
        scope: { table_name: 'post' },
        as: 'fields',
      });
    }
  }

  Post.init(
    {
      category_id: { type: DataTypes.INTEGER, allowNull: false },
      title: { type: DataTypes.STRING, allowNull: false },
      slug: { type: DataTypes.STRING, allowNull: false, unique: true },
      short_description: { type: DataTypes.TEXT },
      full_description: { type: DataTypes.TEXT('long') },

      // Business dates shown on the page (distinct from created_at/updated_at
      // audit timestamps, which are also kept for the Record Info box)
      post_date: { type: DataTypes.DATEONLY },
      updated_date: { type: DataTypes.DATEONLY },

      status: { type: DataTypes.BOOLEAN, defaultValue: true },

      // Previously separate `marquees` / `top_boxes` tables that duplicated
      // title+url by hand - folded into the post itself as requested, with
      // one shared colour so the same customisation the old tables allowed
      // (per-item colour) is not lost.
      is_marquee: { type: DataTypes.BOOLEAN, defaultValue: false },
      is_top: { type: DataTypes.BOOLEAN, defaultValue: false },
      highlight_color: { type: DataTypes.STRING(20) },

      // New: per-post analytics counters (detail events also logged to PostView)
      views_count: { type: DataTypes.INTEGER, defaultValue: 0 },
      clicks_count: { type: DataTypes.INTEGER, defaultValue: 0 },

      meta_title: { type: DataTypes.STRING },
      meta_keywords: { type: DataTypes.TEXT },
      meta_description: { type: DataTypes.TEXT },
    },
    {
      sequelize,
      modelName: 'Post',
      tableName: 'posts',
      hooks: {
        beforeValidate(post) {
          if (!post.slug && post.title) post.slug = slugify(post.title);
        },
      },
    }
  );

  return Post;
};
