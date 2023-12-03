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
        if(!postByTopic){
            res.send('[]')
        }
        else{
            res.send(postByTopic)
        }
    }catch(err){
        res.status(400).send({message:err})
    }
})

router.get('/topic/:topicId', verifyToken, async(req,res) =>{

    try{
        const postByTopic = await Post.findOne({topic:req.params.topicId})
        if(!postByTopic){
        res.send('[]')
        }
        else{
        res.send(postByTopic)}
    }catch(err){
        res.status(400).send(err)
    }
    
})

router.post('/interact/:postId', verifyToken, async(req,res) =>{

    try{
        let commentObj = {"comment":req.body.comment,"name":req.body.name}
        console.log(commentObj)
        let postData = await Post.findById(req.params.postId)
        postData.likes = req.body.like ? postData.likes + 1:postData.likes
        postData.dislikes = req.body.dislike ? postData.dislikes + 1:postData.dislikes
        if(req.body.comment){
             postData['comments'].push(commentObj)
        }
        const updatedPost = await Post.updateOne(
            {_id:req.params.postId},
            {$set:{
                title:postData.title,
                topic:postData.topic,
                message:postData.message,
                expiryTime:postData.expiryTime,
                status:postData.status,
                author:postData.author,
                likes:postData.likes,
                dislikes:postData.dislikes,
                comments:postData.comments,
                date:postData.date

            }
            })
        res.send(updatedPost)
    }catch(err){
        res.status(400).send({message:err})
    }
})

module.exports = router