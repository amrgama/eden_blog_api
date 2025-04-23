const User = require("../model/user")
const bcrypt = require("bcrypt");
const helper = require("../util/helper");

const createNewUser = async (req, res)=> {
    const {firstName, lastName, email, password} = req.body;

    if(!firstName || !lastName || !email || !password){
        return res.status(400).json({error: "first name, last name, email and passowrd are required"})
    }

    try{
        const dplUser = await User.findOne({email})
        if(dplUser) return res.sendStatus(409);

        const username = helper.generate_unique_username(`@${firstName}_${lastName}`);
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = User.create({
            firstName, 
            lastName,
            "userName": username,
            "email": email,
            "password" : hashedPassword
        });

        res.status(201).json({"success": `new account created successfully`})
    }
    catch(err){        
        res.status(500).json({error: err.message})
    }
}

module.exports = {createNewUser};