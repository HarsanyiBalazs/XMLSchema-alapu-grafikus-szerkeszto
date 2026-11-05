const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bycrypt = require("bcrypt");
//require('dotenv').config();


const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = {name: "", password: ""};

    //duplicate error code
    if(err.code === 11000){
        errors.name = 'that username is already in use';
        return errors;
    }

    //validation errors
    if (err.message.includes('user validation failed')){
        Object.values(err.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message;
        })
    }

    return errors;
};

const maximumAge = 3 * 24 * 60 * 60;

const createToken = (id) =>{
    /*return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: maximumAge
    });*/
    return jwt.sign({ id }, "5b6533d342ba02b9888f22c66bcce47d84c17718b04620eb75e0ca706ff0f773beb8577772ac4c9eab5636db2837c34123e064fe4e77c21e6c25cb065cfb538a", {
        expiresIn: maximumAge
    });
};

module.exports.signup_post = async (req,res) =>{
    try{
        const newUser = await new User(req.body);
        if(newUser.password.length >7)
        {   
            const salt = await bycrypt.genSalt();
            newUser.password = await bycrypt.hash(newUser.password, salt);
        }
        const savedUser = await newUser.save();
        const token = await createToken(savedUser._id);
        await res.cookie("jwt",token,{httpOnly: true, maxAge: maximumAge * 1000,secure: true});
        res.status(200).json({user: savedUser._id});
    }
    catch(error){
        const errors = handleErrors(error);
        res.status(400).json({errors});
    }
}

module.exports.login_post = async (req,res) =>{
        const loginUser = await new User(req.body);
    try{
        const user = await User.login(loginUser.name,loginUser.password);
        const token = await createToken(user._id);
        await res.cookie("jwt",token,{httpOnly: true, maxAge: maximumAge * 1000,secure: true});
        res.status(200).json({user: user._id});
    }
    catch(error){
        res.status(400).json({message:"an error occured", error: error});
    }
}

module.exports.logout_get = async (req,res) =>{
    res.clearCookie("jwt");
}

module.exports.user_get = async (req,res) =>{
    try{
        const token = await req.cookies.jwt;
        if (token){
            jwt.verify(token,"5b6533d342ba02b9888f22c66bcce47d84c17718b04620eb75e0ca706ff0f773beb8577772ac4c9eab5636db2837c34123e064fe4e77c21e6c25cb065cfb538a",async (err, decodedToken)=>{
                if(err){
                    console.log(err.message);
                    throw(Error("401"));
                }else{
                    console.log(decodedToken)
                    let user = await User.findById(decodedToken);
                    res.status(200).json({user: user._id});
                }
                })
            }else{
                //401 not logged in 403 no permission
                res.local.user = null;
                throw(Error("401"));
            }  
    }
    catch(error){
        res.status(401).json({message:"no user is logged in"});
    }
}
