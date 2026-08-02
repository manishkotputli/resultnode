'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ContactMessage extends Model {
    static associate() {}
  }
  ContactMessage.init(
    {
      name: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false },
      subject: DataTypes.STRING,
      message: { type: DataTypes.TEXT, allowNull: false },
      is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    { sequelize, modelName: 'ContactMessage', tableName: 'contact_messages' }
  );
  return ContactMessage;
};
