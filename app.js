const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const fileRoutes = require('./routes/files');

const app = express();

const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

mongoose.connect('Mongodb_Url', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000 
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/files', fileRoutes);

app.get('/', (req, res) => {
  res.redirect('/files');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Admin dashboard running on http://localhost:${PORT}`);
});