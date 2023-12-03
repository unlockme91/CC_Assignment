const express = require('express')
const router = express.Router()

const Post = require('../models/Post')
const verifyToken = require('../verifyToken')

router.post('/', verifyToken, async(req,res) =>{
    const postData = new this.post()
    try{
        const films = await Film.find()
        res.send(films)
    }catch(err){
        res.status(400).send({message:err})
    }
})

module.exports = router