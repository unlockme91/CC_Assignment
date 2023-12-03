const express = require('express')
const { date } = require('joi')
const router = express.Router()

const Post = require('../models/Post')
const verifyToken = require('../verifyToken')

router.post('/', verifyToken, async(req,res) =>{
    let Status
    let dt = new Date(req.body.expiryTime)

    console.log(dt.getTime())
    if (dt.getTime() > Date.now()){
       Status = 'Live'
    }
    else{
        Status= 'Expired'
    }
    const postReqData = new Post({
        title:req.body.title,
        topic:req.body.topic,
        message:req.body.message,
        expiryTime:req.body.expiryTime,
        status:Status,
        author:req.body.author

    })
    try{
        const postData = await postReqData.save()
        res.send(postData)
    }catch(err){
        res.status(400).send({message:err})
    }
})

router.get('/', verifyToken, async(req,res) =>{

    try{
        const postData = await Post.find()
        res.send(postData)
    }catch(err){
        res.status(400).send({message:err})
    }
})

router.get('/:topic', verifyToken, async(req,res) =>{

    try{
        const postByTopic = await Post.findOne({topic:req.params.topic})
        res.send(postByTopic)
    }catch(err){
        res.status(400).send({message:err})
    }
})

module.exports = router