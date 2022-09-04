module.exports = {
  PORT: process.env.PORT || 3000,
  DB: process.env.DB || 'mongodb://127.0.0.1:27017/buylist',
  crypto: {
    salt: 'Leks',
    iterations: 10,
    length: 128,
    digest: 'sha512',
  },
};
