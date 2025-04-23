const router = require("express").Router();
const postController = require("../controllers/postController");
const isAuth = require("../middleware/isAuth");
const upload = require("../middleware/upload");
const verfiyJWT = require("../middleware/verifyJWT");
const fileController = require("../controllers/fileController")

router
.get("/", postController.getPostsByQuery)
.get("/all", postController.getPosts)
.get("/more", postController.getUserPosts)
.get("/:id", postController.getPostById)
.post("/uploadImage", upload.single("image"), fileController.sendFileUrl)
.post("/create", isAuth, verfiyJWT, postController.createPost)
.put("/react", isAuth, verfiyJWT, postController.reactOnPost)
.put("/increase-readings", postController.increaseReadingsByOne)
.put("/save/:id", isAuth, verfiyJWT, postController.addToSaveList)
.put("/edit/:id", isAuth, verfiyJWT, postController.editPost)
.delete("/delete/:id", isAuth, verfiyJWT, postController.deletePost)
.put("/:id/userComment/create", isAuth, verfiyJWT, postController.createUserComment)
.put("/:id/guestComment/create", postController.createGuestComment)
.get("/:id/comments", postController.getComments)
.put("/:id/comment/:commentId/reply/create", isAuth, verfiyJWT, postController.createReplyToComment)
.get("/:id/comment/:commentId/replies", postController.getCommentMainReplies)
.post("/:id/comment/:commentId/reply/:replyId/subReply/create", isAuth, verfiyJWT, postController.createReplyToReply)
.get("/:id/comment/:commentId/reply/:replyId/subReplies", postController.getRepliesToReply)

module.exports = router;