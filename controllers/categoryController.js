const mongoose = require("mongoose")
const Category = require("../model/category")

const createCategory = async(req, res)=>{
    const {categories} = req.body

    if(!categories) return res.sendStatus(400);

    try{ 
        Category.create({categories})

        res.sendStatus(200)
    }
    catch(err){
        res.sendStatus(500)
    }
}

const getCategories = async(req, res)=>{
    const {categoryId} = req.params.id

    if(!categoryId) return res.sendStatus(400);

    try{
        const foundCategory = await Category.findById(categoryId).exec()
        
        if(!foundCategory) return res.sendStatus(400)

        res.status(200).json({"categories": foundCategory.categories})
    }
    catch(err){
        res.sendStatus(500)
    }
}

const addCategory = async(req, res)=>{
    const {categoryId} = req.params.id
    const {category} = req.body

    if(!category || !categoryId) return res.sendStatus(400);

    try{
        const foundCategory = await Category.findById(categoryId).exec()
        
        if(!foundCategory) return res.sendStatus(400)

        let newCategories = [...foundCategory.categories]
        newCategories.push(category)
        
        Category.updateOne({_id: foundCategory._id}, {newCategories})

        res.status(200).json({"categories": newCategories})
    }
    catch(err){
        res.sendStatus(500)
    }
}

const removeCategory = async(req, res)=>{
    const {categoryId} = req.params.id
    const {category} = req.body

    if(!category || !categoryId) return res.sendStatus(400);

    try{
        const foundCategory = await Category.findById(categoryId).exec()
        
        if(!foundCategory) return res.sendStatus(400)

        let newCategories = foundCategory.categories.filter(cat => cat !== category)
        
        Category.updateOne({_id: foundCategory._id}, {newCategories})

        res.status(200);
    }
    catch(err){
        res.sendStatus(500)
    }
}


module.exports = {createCategory, getCategories, addCategory, removeCategory}