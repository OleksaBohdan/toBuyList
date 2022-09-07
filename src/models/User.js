const mongoose = require('mongoose');
const crypto = require('crypto');
const config = require('../config/config');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: 'E-mail cannot be empty',
      unique: true,
    },
    passwordHash: {
      type: String,
      required: 'Password cannot be empty',
      required: true,
    },
    salt: { type: String },
  },
  { timestamps: true }
);

function generatePassword(salt, password) {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, config.crypto.iterations, config.crypto.length, config.crypto.digest, (err, key) => {
      if (err) return reject(err);
      resolve(key.toString('hex'));
    });
  });
}

function generateSalt() {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(config.crypto.length, (err, buffer) => {
      if (err) return reject(err);
      resolve(buffer.toString('hex'));
    });
  });
}

userSchema.methods.setPassword = async function setPassword(password) {
  this.salt = await generateSalt();
  this.passwordHash = await generatePassword(this.salt, password);
};

userSchema.methods.checkPassword = async function checkPassword(password) {
  if (!password) return false;

  const hash = await generatePassword(this.salt, password);
  return hash === this.passwordHash;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
