const router = require("express").Router();
const authController = require("../controllers/authController");
const isAuth = require("../middleware/isAuth");

router.post("/login", authController.handleLogIn)
router.get("/logout", isAuth, authController.handleLogOut)

module.exports = router