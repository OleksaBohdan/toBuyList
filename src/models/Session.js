const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: 'User',
  },
  token: {
    type: String,
    require: true,
  },

  lastVisit: {
    type: Date,
    required: false,
  },
});

sessionSchema.path('lastVisit').index({ expires: '30d' });

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
