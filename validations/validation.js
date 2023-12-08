const joi = require('joi')  //this package allows users to apply all field level validations here.

const registerValidation = (data) => {       
    const schemaValidation = joi.object({                        //Creatng an object of joi and passing all the fields validations.
        username:joi.string().required().min(3).max(256),
        email:joi.string().required().min(6).max(256).email(),
        password:joi.string().required().min(6).max(1024)        
    })
    return schemaValidation.validate(data)                     //Appplying the above validations to the user input and returning the result.
}

const loginValidation = (data) => {                    // Same as above
    const schemaValidation = joi.object({
        email:joi.string().required().min(6).max(256).email(),
        password:joi.string().required().min(6).max(1024)        
    })
    return schemaValidation.validate(data)
}

module.exports.registerValidation = registerValidation   //exporting both the functions
module.exports.loginValidation = loginValidation
