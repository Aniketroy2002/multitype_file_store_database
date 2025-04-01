// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const path = require('path');
// const File = require('../models/File');

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.join(__dirname, '../public/uploads'));
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   }
// });
// const upload = multer({ storage: storage });

// // Display all files
// router.get('/', async (req, res) => {
//   try {
//     const files = await File.find().sort({ uploadDate: -1 });
//     res.render('index', { files });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Server Error');
//   }
// });

// // Upload file
// router.post('/upload', upload.single('file'), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).send('No file uploaded');
//     }

//     const newFile = new File({
//       filename: req.file.filename,
//       originalname: req.file.originalname,
//       mimetype: req.file.mimetype,
//       size: req.file.size,
//       path: req.file.path
//     });

//     await newFile.save();
//     res.redirect('/files');
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Server Error');
//   }
// });

// // Delete file
// router.post('/delete/:id', async (req, res) => {
//   try {
//     const file = await File.findByIdAndDelete(req.params.id);
//     if (!file) {
//       return res.status(404).send('File not found');
//     }
//     res.redirect('/files');
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Server Error');
//   }
// });

// module.exports = router;



const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const { GridFSBucket } = require('mongodb');
const path = require('path');
const fs = require('fs');
const File = require('../models/File');

// Initialize GridFS bucket
let gfsBucket;
const conn = mongoose.connection;
conn.once('open', () => {
  gfsBucket = new GridFSBucket(conn.db, {
    bucketName: 'uploads' // matches your schema
  });
});

// Remove multer disk storage - we'll use memory storage instead
const upload = multer({ storage: multer.memoryStorage() });

// Display all files
router.get('/', async (req, res) => {
  try {
    const files = await File.find().sort({ uploadDate: -1 });
    res.render('index', { files });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Upload file (updated for GridFS)
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded');
    }

    // Create write stream to GridFS
    const writeStream = gfsBucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype
    });

    // Write file buffer to GridFS
    writeStream.end(req.file.buffer);

    writeStream.on('finish', async (file) => {
      // Create record using our updated schema
      const newFile = new File({
        filename: file.filename,
        originalname: req.file.originalname,
        mimetype: file.contentType,
        size: file.length,
        fileId: file._id,
        chunkSize: file.chunkSize
      });

      await newFile.save();
      res.redirect('/files');
    });

    writeStream.on('error', (err) => {
      console.error(err);
      res.status(500).send('Error uploading file');
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Download file (new endpoint)
router.get('/download/:id', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).send('File not found');
    }

    const readStream = gfsBucket.openDownloadStream(file.fileId);

    readStream.on('error', () => {
      res.status(404).send('File not found in storage');
    });

    res.set('Content-Type', file.mimetype);
    res.set('Content-Disposition', `attachment; filename="${file.originalname}"`);
    
    readStream.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Delete file (updated for GridFS)
router.post('/delete/:id', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).send('File not found');
    }

    // Delete from GridFS
    await gfsBucket.delete(file.fileId);
    
    // Delete from our File collection
    await File.findByIdAndDelete(req.params.id);
    
    res.redirect('/files');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
