const router = require("express").Router();
const emploiesControllers = require("../controllers/emploiesControllers")
const verfiyJWT = require("../middleware/verifyJWT");

router.get("/", verfiyJWT, emploiesControllers.addEmploies)

module.exports = router;