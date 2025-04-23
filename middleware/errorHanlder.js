const errorHandler = (err, req, res, next)=> {
    // if(err){
    //     console.error(err.stack)
    //     res.status(500)
    //     res.json({error: err.message})
    // }
    console.error("stack",err.stack)
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode)
    res.json({error: err.message})
}

module.exports = errorHandler;