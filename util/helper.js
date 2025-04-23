const fs = require("fs")

function generate_unique_username(prefix){
    const maxPrefixLength = 12;
    if(prefix.length > maxPrefixLength){
        const negativeDifference = maxPrefixLength - prefix.length;
        prefix = prefix.slice(0, negativeDifference);

        prefix = (prefix.endsWith("_"))? prefix.slice(0, -1) : prefix;
    }
    const uniquePart = Date.now().toString(36);
    const username = `${prefix}_${uniquePart}`;
    return username;
}

const isValidObj = (obj,props) => {
    const validKey = props.some(prop => obj.hasOwnProperty(prop));
    console.log("validkey: "+validKey)

    const validVal = Object.values(obj).every(val =>{
        return val !== null && val !== undefined && val !== ""
    });
    console.log("validVal: "+validVal)

    return (validKey !== false) && (validKey !== false)
};

const removeFile = async(path)=>{
    if(fs.existsSync(path)){
        await fs.unlink(path, err=>{
            if(err){
                throw err;
            }
        })
    }
    else{
        console.log("file path does not exist")
    }
}

module.exports = {
    generate_unique_username,
    isValidObj,
    removeFile
}