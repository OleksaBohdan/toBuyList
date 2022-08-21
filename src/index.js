const app = require('./app');
const config = require('./config/config');
const mongoose = require('mongoose');

try {
  mongoose.connect(config.DB, console.log(`MongoDB connected`));
  app.listen(config.PORT, console.log(`Server started on port ${config.PORT}`));
} catch (e) {
  console.log(e.message);
}
