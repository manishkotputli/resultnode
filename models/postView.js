'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  // New: granular per-record view/click log (trackable_type/trackable_id),
  // for the category-wise "kis post ka view/click kitna hai" admin analytics.
  // Append-only, so no updated_at.
  class PostView extends Model {
    static associate() {}
  }
  PostView.init(
    {
      trackable_type: { type: DataTypes.STRING, allowNull: false },
      trackable_id: { type: DataTypes.INTEGER, allowNull: false },
      event_type: { type: DataTypes.STRING(10), allowNull: false }, // view | click
      user_id: { type: DataTypes.INTEGER },
      ip_address: DataTypes.STRING,
      user_agent: DataTypes.STRING,
      referrer_url: DataTypes.STRING,
    },
    {
      sequelize, modelName: 'PostView', tableName: 'post_views', timestamps: false,
      indexes: [{ fields: ['trackable_type', 'trackable_id'] }],
    }
  );
  return PostView;
};
