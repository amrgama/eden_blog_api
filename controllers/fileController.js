const path= require("path");
const fs= require("fs");

const sendFileUrl = async(req, res)=>{
    // console.log("requpload",req)
    const file = req.file;
    // const url = "http://localhost:3500/uploads/"+file.filename
    const url = "/uploads/"+file.filename
    const image = url;
    // console.log("image", image)
    res.status(200).json({image});
}

const updateFile= async(req, res, next)=>{
    try{
        console.log("inUpdating**********");
        const filePath= path.join(__dirname, "..", "/public/uploads", req.params.imgName);
        if(fs.existsSync(filePath)){
            await fs.unlink(filePath, (err)=>{
                if(err) {
                    console.log("error when delete file with path: ", filePath);
                    console.log("error", err);
                    throw err;
                }
            })
            const url = "/uploads/"+req.file.filename
            const image = url;
            console.log("uploaded image path", image);
            return res.status(200).json({
                message: "file deleted successfully",
                image
            });
        }
        const newFilePath= path.join(__dirname, "..", "/public/uploads", req.file.filename);
        await fs.unlink(newFilePath, (err)=>{
            if(err) {
                console.log("error when update file with path: ", newFilePath);
                console.log("error", err);
                throw err;
            }
        })
        res.status(400).json({
            message: `can not find path: ${filePath}`
        })
    }
    catch(error){
        console.log("error in updateFile>>", error)
        return res.sendStatus(500)
    }
}
const deleteFile= async(req, res, next)=>{
    try{
        const filePath= path.join(__dirname, "..", "/public/uploads", req.params.imgName);
        if(fs.existsSync(filePath)){
            await fs.unlink(filePath, (err)=>{
                if(err) {
                    console.log("error when delete file with path: ", filePath);
                    console.log("error", err);
                    throw err;
                }
            })
            return res.status(200).json({
                message: "file deleted successfully",
            });
        }
        res.status(400).json({
            message: `can not find path: ${filePath}`
        })
    }
    catch(error){
        return res.sendStatus(500)
    }
}

module.exports = {
    sendFileUrl,
    updateFile,
    deleteFile
}