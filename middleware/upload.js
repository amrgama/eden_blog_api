const multer = require("multer")
const path = require("path")
const fs= require("fs");

const upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        let filePath = path.join(__dirname, "..", '/public/uploads/');
        console.log("filepath", filePath)
        fs.mkdirSync(filePath, { recursive: true });
        cb(null, filePath);
      },
      filename: (req, file, cb) => {
        // const ext = file.mimetype.split("/")[1];
        let fileName = `${Date.now()}_${file.originalname}`;
        cb(null, fileName);
      },
    })
})

// const upload = multer({storage})

module.exports = upload;