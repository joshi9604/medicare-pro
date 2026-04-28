// const { Sequelize } = require('sequelize');
// require('dotenv').config();

// const sequelize = new Sequelize(
//   process.env.DB_NAME || 'medicare_pro',
//   process.env.DB_USER || 'postgres',
//   process.env.DB_PASSWORD || 'qwer',
//   {
//     host: process.env.DB_HOST || 'localhost',
//     port: process.env.DB_PORT || 5432,
//     dialect: 'postgres',
//     logging: false,
//     pool: {
//       max: 10,
//       min: 0,
//       acquire: 30000,
//       idle: 10000
//     }
//   }
// );

// const testConnection = async () => {
//   try {
//     await sequelize.authenticate();
//     console.log('✅ PostgreSQL Connected');
//   } catch (error) {
//     console.error('❌ PostgreSQL Connection Error:', error.message);
//     process.exit(1);
//   }
// };

// module.exports = { sequelize, testConnection };

// const { Sequelize } = require('sequelize');
// require('dotenv').config();

// const isProduction = process.env.NODE_ENV === 'production';

// const sequelize = process.env.DATABASE_URL
//   ? new Sequelize(process.env.DATABASE_URL, {
//       dialect: 'postgres',
//       logging: false,
//       protocol: 'postgres',
//       dialectOptions: isProduction
//         ? {
//             ssl: {
//               require: true,
//               rejectUnauthorized: false,
//             },
//           }
//         : {},
//       pool: {
//         max: 10,
//         min: 0,
//         acquire: 30000,
//         idle: 10000,
//       },
//     })
//   : new Sequelize(
//       process.env.DB_NAME || 'medicare_pro',
//       process.env.DB_USER || 'postgres',
//       process.env.DB_PASSWORD || 'qwer',
//       {
//         host: process.env.DB_HOST || 'localhost',
//         port: process.env.DB_PORT || 5432,
//         dialect: 'postgres',
//         logging: false,
//         pool: {
//           max: 10,
//           min: 0,
//           acquire: 30000,
//           idle: 10000,
//         },
//       }
//     );

// const testConnection = async () => {
//   try {
//     await sequelize.authenticate();
//     console.log('✅ PostgreSQL Connected');
//   } catch (error) {
//     console.error('❌ PostgreSQL Connection Error:', error.message);
//     process.exit(1);
//   }
// };

// module.exports = { sequelize, testConnection };
// const { Sequelize } = require("sequelize");
// require("dotenv").config();

// const isProduction = process.env.NODE_ENV === "production";

// const sequelize = new Sequelize(process.env.DATABASE_URL, {
//   dialect: "postgres",
//   logging: false,
//   pool: {
//     max: 10,
//     min: 0,
//     acquire: 30000,
//     idle: 10000,
//   },
//   dialectOptions: isProduction
//     ? {
//         ssl: {
//           require: true,
//           rejectUnauthorized: false,
//         },
//       }
//     : {},
// });

// const testConnection = async () => {
//   try {
//     await sequelize.authenticate();
//     console.log("✅ PostgreSQL Connected");
//   } catch (error) {
//     console.error("❌ PostgreSQL Connection Error:", error.message);
//   }
// };

// module.exports = { sequelize, testConnection };

const { Sequelize } = require('sequelize');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

let sequelize;

if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '') {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: isProduction
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : {},
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'medicare_pro',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'qwer',
    {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      dialect: 'postgres',
      logging: false,
    }
  );
}

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL Connected');
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error.message);
  }
};

module.exports = { sequelize, testConnection };