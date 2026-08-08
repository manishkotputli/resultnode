'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  // Generic EAV-style table replacing the half-finished post_meta/post_metas
  // duplicate. Works against ANY table (post, blog, course...) via
  // table_name + record_id, so new attributes never need a migration again.
  class DynamicField extends Model {
    static associate() {}
  }

  DynamicField.init(
    {
      table_name: { type: DataTypes.STRING, allowNull: false },
      record_id: { type: DataTypes.INTEGER, allowNull: false },
      // Section heading these fields render under, e.g. "Important Dates",
      // "Application Fee" - lets the view group fields exactly like the
      // original hand-built post-detail table did.
      group_name: { type: DataTypes.STRING },
      field_label: { type: DataTypes.STRING, allowNull: false },
      // text | number | date | textarea | richtext | url
      field_type: { type: DataTypes.STRING(20), defaultValue: 'text' },
      field_value: { type: DataTypes.TEXT('long') },
      sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    {
      sequelize,
      modelName: 'DynamicField',
      tableName: 'dynamic_fields',
      timestamps: false,
      indexes: [{ fields: ['table_name', 'record_id'] }],
    }
  );

  return DynamicField;
};
