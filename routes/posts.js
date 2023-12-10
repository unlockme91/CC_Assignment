const express = require('express')
const { date } = require('joi')
const router = express.Router()

const Post = require('../models/Post')
const User = require('../models/User')
const verifyToken = require('../verifyToken')
const monitorPostStatus = require('../monitorPostStatus')

router.post('/', verifyToken, async(req,res) =>{ //If the user sends the request on POST: /api/post to post a comment 
    let Status                                   //This will be send to this code block
    let dt = new Date(req.body.expiryTime)       // Also we are calling middleware function(verifyToken) to check if token is correct
    if (dt.getTime() > Date.now()){
       Status = 'Live'
    }
    else{
        Status= 'Expired'
    }
    let userData = await User.find({Token:req.header('auth-token')}) //fetching the user data corresponding with token
    const postReqData = new Post({    //Building the data for 'post' collection acc to schema mappings 
        title:req.body.title,
        topic:req.body.topic,
        message:req.body.message,
        expiryTime:req.body.expiryTime,
        status:Status,
        author:userData[0].username  //fetching the username from above user data for corresponding token

    })
    try{
        const postData = await postReqData.save() //Saving the post data in Mongo DB 'post' collection
        res.send(postData)                        //Sending the saved response to user as API response
    }catch(err){
        res.status(400).send({message:err})      //This is to throw appropriate error in case request is incorrect
    }
})


//Request to interact with post - likes/dislikes and comments will be received by this post code block.
//Also two middleware functions verifyToken and monitorPostStatus will be called before any operation in all endpoints
//verifyToken will be called to check the validity of the token
//and monitorPostStatus will be called to keep the status of message up to date('Expired' if beyong expiry time)

router.post('/interact/:postId', verifyToken,monitorPostStatus, async(req,res) =>{
    try{
           
        let postData = await Post.findById(req.params.postId)
        let userData = await User.find({Token:req.header('auth-token')}) //fetchig the user data scorresponding to token

        if(postData.author != userData[0].username) {                  //Author of the post will not be allowed to interact.

        if(postData.status == 'Live'){                      //Interaction is only allowed with Live Post      

        let commentObj = {"comment":req.body.comment,"name":userData[0].username} //fetching the username corresponding to token
                                                                                 //and assigning them to name attribute.
        postData.likes = req.body.like ? postData.likes + 1:postData.likes
        postData.dislikes = req.body.dislike ? postData.dislikes + 1:postData.dislikes //likes or dislikes attribute in post is
        if(req.body.comment){                                                        // incremented by one if passed true in request.
             postData['comments'].push(commentObj)    // comment along with commentor name is added.                             
        }
        const updatedPost = await Post.updateOne(    //update the above chnages in the post data in collection.
            {_id:req.params.postId},
            {$set:{likes:postData.likes,
                dislikes:postData.dislikes,
                comments:postData.comments
            }
            })
        res.send(updatedPost)}
        else{
            res.status(400).send({message:'No action can be performed on expired post'})//Error message when interacted with expired post.
        }
    }
    else{
        res.status(400).send({message:'Author cannot interact with his/her own post'})//Error message when interacted with own post
    }
    }catch(err){
        res.status(400).send({message:err})
    }
})

//Request to get all post per topic - topicId as parameter 
router.get('/topic/:topicId', verifyToken,monitorPostStatus, async(req,res) =>{
                                                                
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



//Request to get active post per topic is forwarded here.
router.get('/active/:topicId', verifyToken, monitorPostStatus,async(req,res) =>{ 

    try{
        //Accessed: 8/12/2023 ,https://thecodebarbarian.com/how-find-works-in-mongoose.html for find() function
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



//Request to get all expired post per topic will be received by this code block
router.get('/expired/:topicId', verifyToken,monitorPostStatus, async(req,res) =>{  
                                                      
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


module.exports = router