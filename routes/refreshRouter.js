const router = require("express").Router();
const handleRefreshToken = require("../controllers/handleRefreshToken");


router.get("/", handleRefreshToken);

module.exports = router