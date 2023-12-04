const express = require('express')
const { date } = require('joi')
const router = express.Router()

const Post = require('../models/Post')
const verifyToken = require('../verifyToken')

router.post('/', verifyToken, async(req,res) =>{
    let Status
    let dt = new Date(req.body.expiryTime)
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
        if(!postData){
            res.send('[]')
        }
        else{
            res.send(postData)
        }
    }catch(err){
        res.status(400).send({message:err})
    }
})

router.get('/expired/:topicId', verifyToken, async(req,res) =>{

    try{
        const postData = await Post.find({status:'Expired', topic:req.params.topicId})
        if(!postData){
            res.send('[]')
        }
        else{
            res.send(postData)
        }
    }catch(err){
        res.status(400).send({message:err})
    }
})

router.get('/topic/:topicId', verifyToken, async(req,res) =>{

    try{
        const postByTopic = await Post.find({topic:req.params.topicId})
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
           
        let postData = await Post.findById(req.params.postId)
        let timeLeftMs = (new Date(postData.expiryTime)).getTime()  - Date.now()
        if(timeLeftMs > 0){
        let commentObj = {"comment":req.body.comment,"name":req.body.name} 
        postData.likes = req.body.like ? postData.likes + 1:postData.likes
        postData.dislikes = req.body.dislike ? postData.dislikes + 1:postData.dislikes
        if(req.body.comment){
             postData['comments'].push(commentObj)
        }
        const updatedPost = await Post.updateOne(
            {_id:req.params.postId},
            {$set:postData
            })
        res.send(updatedPost)}
        else{
            res.send({message:'No action can be performed on expired post'})
        }
    }catch(err){
        res.status(400).send({message:err})
    }
})

router.get('/active/:topicId', verifyToken, async(req,res) =>{

    try{
        const postByTopic = await Post.find({topic:req.params.topicId, status:'Live'})
        if(!postByTopic){
        res.send('[]')
        }
        else{
        let sum = 0
        let activePost = []
        for(let i in postByTopic){

                let postById = await Post.findById(postByTopic[i]._id)
                let sumLikesDislikes = postById.likes + postById.dislikes
                if(sumLikesDislikes==sum){
                    activePost.push(postByTopic[i])
                }
                else if(sumLikesDislikes>sum){ 
                    activePost = []
                    sum = sumLikesDislikes
                    activePost.push(postByTopic[i])


            }
        }
        res.send(activePost)}
    }catch(err){
        res.status(400).send(err)
    }
    
})

module.exports = router