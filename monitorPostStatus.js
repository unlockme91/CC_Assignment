
const Post = require('./models/Post')

const monitorPostStatus = async(req,res,next)=>{
    const postData =  await Post.find()
    for(let post in postData){
        let expiryTimeMs = new Date(postData[post].expiryTime).getTime()  //Getting the expiry time in Millisecond
        if(Date.now() >= expiryTimeMs){        //If post is beyond expiry time then updating the status to Expired.
            postData[post].status = 'Expired'
            await Post.updateOne(
            {_id:postData[post]._id},
            {$set:{status:postData[post].status               //Updating the status chnage in the posts collecton in MongoDB
        }
        })
        }
    }
    next()
}

module.exports= monitorPostStatus