require('dotenv').config();

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

async function ensureDoctorAddressColumns() {
  const queryInterface = sequelize.getQueryInterface();
  const table = await queryInterface.describeTable('doctors');
  const columns = [
    ['address_street', { type: DataTypes.STRING, allowNull: true }],
    ['address_city', { type: DataTypes.STRING, allowNull: true }],
    ['address_state', { type: DataTypes.STRING, allowNull: true }],
    ['address_landmark', { type: DataTypes.STRING, allowNull: true }],
    ['address_pincode', { type: DataTypes.STRING, allowNull: true }]
  ];

  for (const [name, definition] of columns) {
    if (!table[name]) {
      await queryInterface.addColumn('doctors', name, definition);
      console.log(`Added doctors.${name}`);
    } else {
      console.log(`Already exists: doctors.${name}`);
    }
  }
}

async function main() {
  try {
    await sequelize.authenticate();
    await ensureDoctorAddressColumns();
    console.log('Doctor address columns are ready.');
    process.exit(0);
  } catch (error) {
    console.error('Failed to ensure doctor address columns:', error.message);
    process.exit(1);
  }
}

main();
