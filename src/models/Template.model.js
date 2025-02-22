const mongoose = require('mongoose');

const TemplateSchema = new mongoose.Schema({
  templateName: { type: String, required: true },
  categoryType: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  createdOn: { type: Date, default: Date.now },
  createdById: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true },
  code: { type: String, required: true }, // Or mongoose.Schema.Types.Mixed for JSON/HTML
});

module.exports = mongoose.models.Template || mongoose.model('Template', TemplateSchema);