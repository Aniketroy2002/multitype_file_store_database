// const express = require('express');
// const mongoose = require('mongoose');
// const path = require('path');
// const fs = require('fs');
// const fileRoutes = require('./routes/files');

// const app = express();

// const uploadsDir = path.join(__dirname, 'public', 'uploads');
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir, { recursive: true });
// }

// mongoose.connect('mongodb+srv://aniketroy:file_store@cluster0.c6d5w9o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   serverSelectionTimeoutMS: 30000 
// })
// .then(() => console.log('Connected to MongoDB'))
// .catch(err => console.error('MongoDB connection error:', err));

// app.use(express.urlencoded({ extended: true }));
// app.use(express.static(path.join(__dirname, 'public')));

// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');

// app.use('/files', fileRoutes);

// app.get('/', (req, res) => {
//   res.redirect('/files');
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Admin dashboard running on http://localhost:${PORT}`);
// });



const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const fileRoutes = require('./routes/files');

const app = express();

// Remove the uploads directory creation since we're using GridFS now
// (Keep this only if you need it for other purposes)
// const uploadsDir = path.join(__dirname, 'public', 'uploads');
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir, { recursive: true });
// }

// Enhanced MongoDB connection with better options
mongoose.connect('mongodb+srv://aniketroy:file_store@cluster0.c6d5w9o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000, // Added for file operations that might take longer
  maxPoolSize: 10 // Better connection pool management
})
.then(() => {
  console.log('Connected to MongoDB');
  
  // Initialize GridFS bucket after connection is established
  const gfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'uploads'
  });
  
  // Make it available in app locals
  app.locals.gfsBucket = gfsBucket;
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1); // Exit if DB connection fails
});

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Add JSON body parser for API endpoints
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Routes
app.use('/files', fileRoutes);

app.get('/', (req, res) => {
  res.redirect('/files');
});

// Error handling middleware (important for file operations)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
