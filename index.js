const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const cors = require('cors');
app.use(cors());
const cloudinaryUpload = require('./cloudinary');
// Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads'); // Files will be saved in the 'uploads' folder
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${Date.now()}${ext}`);
        // cb(null, `new_image${ext}`);
    },
});

// Initialize multer
const upload = multer({ storage });

// Serve HTML form to upload the file
app.get('/', (req, res) => {
    res.send(`
    <form action="/upload" method="post" enctype="multipart/form-data">
      <input type="file" name="image" />
      <button type="submit">Upload</button>
    </form>
  `);
});

const deleteImage = (imagePath) => {
    fs.access(imagePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.error('File does not exist.');
            return;
        }

        // File exists, so delete it
        fs.unlink(imagePath, (err) => {
            if (err) {
                console.error('Error deleting the file:', err);
                return;
            }
            console.log('File deleted successfully.');
        });
    });
}

// Handle file upload
app.post('/upload', upload.single('image'), async (req, res) => {
    console.log(' uploading')
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    // Process the uploaded file (for example, save it to the database)
    const filePath = req.file.path;
    const imageId = await cloudinaryUpload(filePath);
    deleteImage(filePath)

    // Respond with a text message
    res.send(JSON.stringify({imageId}));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
