const { send } = require('express/lib/response')
const jsonwebtoken = require('jsonwebtoken')

function auth(req,res,next){
    const token = req.header('auth-token')  //extracts the token from the request header.
    if(!token){
        return res.status(401).send({message:'Access denied'})  //sending the code 401 - Error for Unauthorised access
    }
    try{
        const verified = jsonwebtoken.verify(token,process.env.TOKEN_SECRET) //Verification of token with the help of Secret key
        req.user=verified                                                    //returns the verification result.
        next()                                                               //passing over the control to the next set of operations.
    }catch(err){
        return res.status(401).send({message:'Invalid token'})
    }
}

module.exports=auth