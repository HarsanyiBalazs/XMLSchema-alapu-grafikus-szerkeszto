const express = require("express");
const router = express.Router();
const FilledForms = require("../models/filledForms");
const {requireAuth, checkUser} = require("../middleware/authMiddleware");
const User = require("../models/user");
const Project = require("../models/project");

//Get filled out forms by schema
router.get('/:schema',checkUser,async (req,res) =>{
    try{
        const schema = req.params.schema;
        const filledForms = await FilledForms.find({ schema : schema });

        if(filledForms[0].formCreator == req.userID){
            res.status(200).json(filledForms);
        }else{
            res.status(403).json({message:"unauthorized user"});
        }

    }
    catch(error){
        res.status(500).json({message:"an error occured", error: error});
    }
});

//Post form
router.post('/public', async (req,res) =>{
    try{
        console.log("valami")
        const newForm = new FilledForms(req.body);

        const token = await req.cookies.jwt;

        if (token){
            jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,async (err, decodedToken)=>{
                if(!err){
                    let user = await User.findById(decodedToken);
                    newForm.formSubmitter = user.name;
                    const savedForm = await newForm.save();
                    res.status(200).json(savedForm);
                }
            })
        };
        
        const savedForm = await newForm.save();
        res.status(200).json(savedForm);
    }
    catch(error){
        console.log("error: "+ error)
        res.status(500).json({message:"an error occured", error: error});
    }
});


module.exports = router;