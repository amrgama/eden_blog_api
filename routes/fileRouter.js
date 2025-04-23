const isAuth = require("../middleware/isAuth");
const upload = require("../middleware/upload");
const verfiyJWT = require("../middleware/verifyJWT");
const fileController = require("../controllers/fileController")
const router = require("express").Router();
// ,isAuth, verfiyJWT

router
.post("/upload", upload.single("image"), fileController.sendFileUrl)


module.exports = router;