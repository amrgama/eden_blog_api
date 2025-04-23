require("dotenv").config();
const express = require("express");
// app
const app = express();
const mongoose = require("mongoose")
const dbConn = require("./config/dbConn")
const path = require("path");
const cors = require("cors");
const credentials = require("./middleware/credentials")
const errorHandler = require("./middleware/errorHanlder");
const corsOptions = require("./config/corsOptions");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken")

// port
const PORT = process.env.PORT || 3500;
// connect to mongoDB
dbConn();
// routes
const registerRouter = require("./routes/registerRouter")
const authRouter = require("./routes/authRouter")
const userRouter = require("./routes/userRouter")
const emploiesRouter = require("./routes/emploiesRouter")
const refreshRouter = require("./routes/refreshRouter");
const postRouter = require("./routes/postRouter");
const fileRouter = require("./routes/fileRouter")
const isAuth = require("./middleware/isAuth");
// middleware

app.use("/", express.static(path.join(__dirname, "/public")))
app.use(credentials)
app.use(cors(corsOptions))
// app.use(cors({origin: "*"}))
app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(cookieParser())


app.use("/file", fileRouter)

app.use("/register", registerRouter)

app.use("/auth", authRouter)

app.use("/refresh", isAuth, refreshRouter)

app.use("/user", userRouter)

app.use("/post", postRouter)

// middleware handle 404 page respons
app.all("*", (req, res)=> {
    res.status(404)
    res.type("txt").send("not found")
})

// handle errors middleware
app.use(errorHandler)

mongoose.connection.once("open", ()=>{
    console.log("connected to MongoBB successfully")
    app.listen(PORT, ()=>{
        console.log("server run successfully")
    })
})