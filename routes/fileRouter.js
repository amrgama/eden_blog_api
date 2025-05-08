const isAuth = require("../middleware/isAuth");
const upload = require("../middleware/upload");
const verfiyJWT = require("../middleware/verifyJWT");
const fileController = require("../controllers/fileController")
const router = require("express").Router();
// ,isAuth, verfiyJWT

router
.post("/upload", isAuth, upload.single("image"), fileController.sendFileUrl)
.put("/:imgName", isAuth, upload.single("image"), fileController.updateFile)
.delete("/:imgName", isAuth, fileController.deleteFile)


module.exports = router;