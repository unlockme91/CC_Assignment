const express = require('express')
const { date } = require('joi')
const router = express.Router()

const Post = require('../models/Post')
const verifyToken = require('../verifyToken')

router.post('/', verifyToken, async(req,res) =>{ //If the user sends the request on POST: /api/post to post a comment 
    let Status                                   //This will be send to this code block
    let dt = new Date(req.body.expiryTime)       // Also we are calling middleware function(verifyToken) to check if token is correct
    if (dt.getTime() > Date.now()){
       Status = 'Live'
    }
    else{
        Status= 'Expired'
    }
    const postReqData = new Post({    //Building the data for 'post' collection acc to schema mappings 
        title:req.body.title,
        topic:req.body.topic,
        message:req.body.message,
        expiryTime:req.body.expiryTime,
        status:Status,
        author:req.body.author

    })
    try{
        const postData = await postReqData.save() //Saving the post data in Mongo DB 'post' collection
        res.send(postData)                        //Sending the saved response to user as API response
    }catch(err){
        res.status(400).send({message:err})      //This is to throw appropriate error in case request is incorrect
    }
})

router.get('/', verifyToken, async(req,res) =>{  //Request to get all the posts will be forwarded to this get code block and
    try{
        const postData = await Post.find()       // verifyToken will be called in between to check the validity of the token
        if(!postData){                           // This will find all the collections matching with 'post' schema mappings
            res.send('[]')
        }
        else{
            res.send(postData)
        }
    }catch(err){
        res.status(400).send({message:err})
    }
})

router.get('/expired/:topicId', verifyToken, async(req,res) =>{ //Request to get all expired post per topic by making topicId 
                                                                //as dynamic parameter
    try{
        const postData = await Post.find({status:'Expired', topic:req.params.topicId}) //multiper filtering paramters in JSONObject 
        if(!postData){                                                                 //to fetch by name and status
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
                                                                //Request to get all post per topic - topicId as parameter 
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

router.post('/interact/:postId', verifyToken, async(req,res) =>{//Request to interact with post - likes/dislikes and comments
                                                                //will be received by this post code block.
    try{
           
        let postData = await Post.findById(req.params.postId)
        if(postData.author != req.body.name) {                  //Author of the post will not be allowed to interact.
        let timeLeftMs = (new Date(postData.expiryTime)).getTime()  - Date.now() // Evaluating time left to expire(in milliseconds)
        if(timeLeftMs > 0){                                                      // if expiry time is greater than current time
        let commentObj = {"comment":req.body.comment,"name":req.body.name}       //then only interaction is allowed.
        postData.likes = req.body.like ? postData.likes + 1:postData.likes
        postData.dislikes = req.body.dislike ? postData.dislikes + 1:postData.dislikes //likes or dislikes attribute in post is
        if(req.body.comment){                                                        // incremented by one if passed true in request.
             postData['comments'].push(commentObj)    // comment along with commentor name is added.                             
        }
        const updatedPost = await Post.updateOne(    //update the above chnages in the post data in collection.
            {_id:req.params.postId},
            {$set:postData
            })
        res.send(updatedPost)}
        else{
            res.send({message:'No action can be performed on expired post'}) 
        }
    }
    else{
        res.send({message:'Author cannot interact with his/her own post'})
    }
    }catch(err){
        res.status(400).send({message:err})
    }
})

router.get('/active/:topicId', verifyToken, async(req,res) =>{ //Request to get active post per topic is forwarded here.

    try{
        const postByTopic = await Post.find({topic:req.params.topicId, status:'Live'})//only Live topic can be active.
        if(!postByTopic){
        res.send('[]')
        }
        else{
        let sum = 0
        let activePost = []
        for(let i in postByTopic){     //iterate over the live posts per topic

                let postById = await Post.findById(postByTopic[i]._id)
                let sumLikesDislikes = postById.likes + postById.dislikes //calculate sum of likes and dislikes of every post in loop
                if(sumLikesDislikes==sum){
                    activePost.push(postByTopic[i])
                }
                else if(sumLikesDislikes>sum){ 
                    activePost = []
                    sum = sumLikesDislikes
                    activePost.push(postByTopic[i]) //storing the post(s) with highest likes/dislikes


            }
        }
        res.send(activePost)}
    }catch(err){
        res.status(400).send(err)
    }
    
})

module.exports = router