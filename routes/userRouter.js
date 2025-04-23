const isAuth = require("../middleware/isAuth");
const verfiyJWT = require("../middleware/verifyJWT");
const userController = require("../controllers/userController")
const fileController = require("../controllers/fileController")
const router = require("express").Router();

router
.get("/:userName/accountInfo", userController.getAccountInfo)
.get("/myAccountInfo", isAuth, verfiyJWT, userController.getMyAccountInfo)
.get("/:userName/userPosts", userController.getUserPosts)
.get("/myPosts", isAuth, verfiyJWT, userController.getMyPosts)
.post("/vector/upload", isAuth, verfiyJWT, fileController.sendFileUrl)
.get("/my-account", isAuth, verfiyJWT, userController.getMyAccount)
.get("/account", userController.getAccount)
.put("/account/edit", isAuth, verfiyJWT, userController.editAccount)
.put("/:accountId/follow", isAuth, verfiyJWT, userController.follow)
.put("/:accountId/unFollow", isAuth, verfiyJWT, userController.unfollow)
.put("/:accountId/block", isAuth, verfiyJWT, userController.block)
.get("/search", userController.search)

module.exports = router;