const express = require('express')
const router = express.Router()

const User = require('../models/User')
const {registerValidation,loginValidation} = require('../validations/validation') 
const bcryptjs = require('bcryptjs')   //this library encrypts/decrypts the password using salt and hashing algorithm.

const jsonwebtoken = require('jsonwebtoken')  //importing this library for generating token and its related validations.

router.post('/register', async(req,res)=>{ //user request to register will be received by this code block

    // Validation 1 to check error in attributes of the request body 

    const {error} = registerValidation(req.body) //Will only extract error attribute if come across any error
    if(error){
        return res.status(400).send({message:error['details'][0]['message']})  //Returning only the message attribute of error
    }

    // Validation 2 to check if user exists!
    const userExists = await User.findOne({email:req.body.email})  //Fetching the records with email passed by user
    
    if(userExists){
        return res.status(400).send({message:'User already exists'}) //sending the error if user records exists
    }

    // Generated a hashed password with the combination of salt

    const salt = await bcryptjs.genSalt(5)   //generates a random salt string. Here 5 indicates complexity
                                             //i.e time taken by hash algorithm. Higher the value better the security

    const hashedPassword = await bcryptjs.hash(req.body.password,salt) //hashed password generation with the combination of salt.
                                                                      //Here same password will also yield different hash representation.
    // Code to insert data
    const user = new User({
        username:req.body.username,
        email:req.body.email,
        password:hashedPassword
    })
    try{
        const savedUser = await user.save() //saving the user details
        res.send(savedUser)
    }catch(err){
        res.status(400).send({message:err})
    }
    
})

router.post('/login', async(req,res)=>{

    // Validation 1 to check user input
    const {error} = loginValidation(req.body)
    if(error){
        return res.status(400).send({message:error['details'][0]['message']})
    }

    // Validation 2 to check if user exists!
    const user = await User.findOne({email:req.body.email})
    if(!user){
        return res.status(400).send({message:'User does not exist'})
    } 
    
    // Validation 3 to check user password
    const passwordValidation = await bcryptjs.compare(req.body.password,user.password) //compares the pasword in user collection in MongoDB 
                                                                                      //with the password in user request body.
    if(!passwordValidation){
        return res.status(400).send({message:'Password is wrong'})
    }
    
    // Generate an auth-token
    const token = jsonwebtoken.sign({_id:user._id}, process.env.TOKEN_SECRET) //Generates a token based on user id and user secret key.
  
    await User.updateOne({email:req.body.email},{$set:{   //saving the token in the corresponding user record
        Token:token                                       //so that username can be fetched later by finding record through token. 
    }
} )
    res.header('auth-token',token).send({'auth-token':token})    //Send the token in response header as well as body.

})

module.exports=router