const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const {cloudinary } = require("../config/cloudinary.config");


const storage = new CloudinaryStorage({
  cloudinary:cloudinary ,
  params: {
    folder: "user_uploads", 
    allowed_formats: ["jpg", "jpeg", "png", "webp"], 
    public_id: (req, file) => `blog_${Date.now()}_${file.originalname.split('.')[0]}`, 
  },
});

const upload = multer({ storage });

module.exports = upload;


