const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  categoryName: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  categoryImagePath: { type: String },
  createdOn: { type: Date, default: Date.now },
  createdById: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
},{ versionKey: false });

module.exports = mongoose.models.Category || mongoose.model('Category', CategorySchema);
