const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
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
  },
  {
    timestamps: true,
  }
);

// sessionSchema.path('lastVisit').index({ expires: 50 });

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
