// const mongoose = require('mongoose');
// const { Schema } = mongoose;

// const fileSchema = new Schema({
//   filename: String,
//   originalname: String,
//   mimetype: String,
//   size: Number,
//   path: String,
//   uploadDate: {
//     type: Date,
//     default: Date.now
//   }
// });

// module.exports = mongoose.model('File', fileSchema);

const mongoose = require('mongoose');
const { Schema } = mongoose;

const fileSchema = new Schema({
  filename: { 
    type: String,
    required: true 
  },
  originalname: { 
    type: String,
    required: true 
  },
  mimetype: { 
    type: String,
    required: true 
  },
  size: { 
    type: Number,
    required: true 
  },
  // Remove the 'path' field as it's likely causing your issue
  // path: String,  // ❌ Remove this - it's probably storing temporary paths
  
  // Add these new fields for GridFS integration
  fileId: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  bucketName: {
    type: String,
    default: 'uploads'  // Should match your GridFS bucket name
  },
  chunkSize: {
    type: Number,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  // Optional metadata field for additional information
  metadata: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true  // Adds createdAt and updatedAt automatically
});

// Add index for faster queries
fileSchema.index({ filename: 1 });
fileSchema.index({ fileId: 1 }, { unique: true });

module.exports = mongoose.model('File', fileSchema);
