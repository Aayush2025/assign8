const express = require('express');
const multer = require('multer');
const path = require('path');
const axios = require('axios');
const fs = require('fs');

const app = express();

// Ensure uploads directory exists
const uploadDir = './uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// File upload setup
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
}).single('myFile');

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.status(400).send({ message: err });
    } else {
      if (req.file == undefined) {
        res.status(400).send({ message: 'No file selected' });
      } else {
        res.send({
          message: 'File uploaded!',
          file: `uploads/${req.file.filename}`
        });
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({
    message: 'Something went wrong!',
    error: err.message
  });
});

app.get('/error', (req, res) => {
  throw new Error('This is a test error');
});

// Weather API integration
app.get('/weather', async (req, res) => {
  try {
    const city = req.query.city;
    if (!city) {
      return res.status(400).send({ message: 'City is required' });
    }

    const apiKey = 'YOUR_OPENWEATHER_API_KEY';
    const response = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${"07020c5baef24899d27e2e72c7f96024"}`);
    res.send(response.data);
  } catch (error) {
    res.status(500).send({ message: 'Error fetching weather data', error: error.message });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
