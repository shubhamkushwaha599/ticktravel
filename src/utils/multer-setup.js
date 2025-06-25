const multer = require('multer');
const path = require('path');
const fs = require('fs');

const configureMulter = ({ imagePath, videoPath }) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = file.fieldname === 'video' ? videoPath : imagePath;
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const safeName = file.originalname.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.-]/g, '');
      cb(null, `${file.fieldname}-${Date.now()}-${safeName}`);
    }
  });

  const fileFilter = (req, file, cb) => {
    const imageTypes = /jpeg|jpg|png/;
    const imageMimes = /image\/jpeg|image\/jpg|image\/png/;
    const videoTypes = /mp4|mov|avi|mkv/;
    const videoMimes = /video\/mp4|video\/quicktime|video\/x-msvideo|video\/x-matroska/;

    const ext = path.extname(file.originalname).toLowerCase();
    const mimetype = file.mimetype;

    const isVideoField = ['video', 'videoUrl'].includes(file.fieldname);

    if (isVideoField) {
      if (videoTypes.test(ext) && videoMimes.test(mimetype)) {
        return cb(null, true);
      }
      return cb(new Error('Only video files (mp4, mov, avi, mkv) are allowed!'));
    } else {
      if (imageTypes.test(ext) && imageMimes.test(mimetype)) {
        return cb(null, true);
      }
      return cb(new Error('Only JPEG, JPG, and PNG images are allowed!'));
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 250 * 1024 * 1024, // Max per file
      files: 12
    }
  });
};

module.exports = configureMulter;
