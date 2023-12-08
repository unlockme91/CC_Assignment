const express = require('express') 
const app = express()  //Creating the app object to run server

const mongoose = require('mongoose')
const bodyParser = require('body-parser')
require('dotenv/config')

app.use(bodyParser.json())

const postRoute = require('./routes/posts') //Importing the router object to route the API functional calls
const authRoute = require('./routes/auth')  //Importing the auth router object to route the API authentication related call

app.use('/api/post',postRoute) //Forwarding the API calls to the corresponding router
app.use('/api/user',authRoute) // In this case functional calls will be sent to post router snd authenticated related calls to auth router

mongoose.connect(process.env.DB_CONNECTOR).then(() => { console.log('Your mongoDB connector is on...')}) //Connecting with MongoDB

app.listen(3000, ()=>{
    console.log('Server is running')   //Opening the port 3000 for receiving the request to this application
})
