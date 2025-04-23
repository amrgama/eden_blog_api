const sendFileUrl = async(req, res)=>{
    // console.log("requpload",req)
    const file = req.file;
    const url = "http://localhost:3500/uploads/"+file.filename
    const image = url;
    // console.log("image", image)
    res.status(200).json({image});
}

module.exports = {
    sendFileUrl
}