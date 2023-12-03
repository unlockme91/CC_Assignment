const express = require('express')
const router = express.Router()

const Post = require('../models/Post')
const verifyToken = require('../verifyToken')

router.post('/', verifyToken, async(req,res) =>{

    
    const postReqData = new Post({
        title:req.body.title,
        topic:req.body.topic,
        message:req.body.message,
        expiryTime:req.body.expiryTime,
        status:req.body.title,
        author:req.body.author

    })
    try{
        const postData = await postReqData.save()
        res.send(postData)
    }catch(err){
        res.status(400).send({message:err})
    }
})

module.exports = router