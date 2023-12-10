const mongoose = require('mongoose')

const postSchema = mongoose.Schema({ //defining the schema for message post
    title:{
        type:String,
        require:true
    },
    topic:{
        type:[String],
        require:true,
        enum:['Politics', 'Sport', 'Health', 'Tech'] //restricting the values of the attributes
    },
    date:{
        type:Date,
        default: Date.now
    },
    message:{
        type:String,
        require:true
    },
    expiryTime:{
        type:Date,
        required:true
    },
    status:{
        type:String
    },
    author:{
        type:String,
        required:true
    },
    likes:{
        type:Number,
        default: 0
    },
    dislikes:{
        type:Number,
        default: 0
    },
    comments:{
        type:Array,
        default:[],
        comment:{
            type:String       //comments attribute  will be array of JSon object with comment and name attributes
        },
        name:{
            type:String
        }

    }
})

module.exports = mongoose.model('posts',postSchema) //mapping the schema with 'posts' collection