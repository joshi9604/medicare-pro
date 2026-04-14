// const { sequelize } = require('../config/database');
// const { DataTypes } = require('sequelize');
// const bcrypt = require('bcryptjs');

// const User = sequelize.define('User', {
//   id: {
//     type: DataTypes.UUID,
//     defaultValue: DataTypes.UUIDV4,
//     primaryKey: true
//   },
//   name: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     trim: true
//   },
//   email: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     unique: true,
//     lowercase: true,
//     validate: { isEmail: true }
//   },
//   password: {
//     type: DataTypes.STRING,
//     allowNull: false
//   },
//   phone: {
//     type: DataTypes.STRING,
//     trim: true
//   },
//   role: {
//     type: DataTypes.ENUM('patient', 'doctor', 'admin'),
//     defaultValue: 'patient'
//   },
//   avatar: {
//     type: DataTypes.STRING,
//     defaultValue: ''
//   },
//   isVerified: {
//     type: DataTypes.BOOLEAN,
//     defaultValue: false
//   },
//   isActive: {
//     type: DataTypes.BOOLEAN,
//     defaultValue: true
//   },
//   addressStreet: DataTypes.STRING,
//   addressCity: DataTypes.STRING,
//   addressState: DataTypes.STRING,
//   addressPincode: DataTypes.STRING,
//   dateOfBirth: DataTypes.DATE,
//   gender: {
//     type: DataTypes.ENUM('male', 'female', 'other')
//   },
//   bloodGroup: {
//     type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
//   },
//   resetPasswordToken: DataTypes.STRING,
//   resetPasswordExpire: DataTypes.DATE
// }, {
//   tableName: 'users',
//   timestamps: true,
//   underscored: true,
//   hooks: {
//     beforeCreate: async (user) => {
//       if (user.password) {
//         user.password = await bcrypt.hash(user.password, 12);
//       }
//     },
//     beforeUpdate: async (user) => {
//       if (user.changed('password')) {
//         user.password = await bcrypt.hash(user.password, 12);
//       }
//     }
//   }
// });

// User.prototype.comparePassword = async function(enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

// module.exports = User;



const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    lowercase: true,
    validate: { isEmail: true }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    trim: true
  },
  role: {
    type: DataTypes.ENUM('patient', 'doctor', 'admin'),
    defaultValue: 'patient'
  },
  avatar: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  addressStreet: DataTypes.STRING,
  addressCity: DataTypes.STRING,
  addressState: DataTypes.STRING,
  addressPincode: DataTypes.STRING,
  dateOfBirth: DataTypes.DATE,
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other')
  },
  bloodGroup: {
    type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
  },
  resetPasswordToken: DataTypes.STRING,
  resetPasswordExpire: DataTypes.DATE
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    }
  }
});

User.prototype.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ✅ Associations
User.associate = (models) => {
  User.hasMany(models.Message, {
    foreignKey: 'senderId',
    as: 'sentMessages'
  });
  User.hasMany(models.Message, {
    foreignKey: 'receiverId',
    as: 'receivedMessages'
  });
};

module.exports = User;