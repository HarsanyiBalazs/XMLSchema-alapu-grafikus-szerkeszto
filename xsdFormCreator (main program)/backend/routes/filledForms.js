const express = require("express");
const router = express.Router();
const FilledForms = require("../models/filledForms");
const {checkUser} = require("../middleware/authMiddleware");
const User = require("../models/user");
const Project = require("../models/project");
const jwt = require("jsonwebtoken");

//Get filled out forms by schema
router.get('/:schema',checkUser,async (req,res) =>{
    try{
        const schema = req.params.schema;
        const filledForms = await FilledForms.find({ schema : schema });

        if (!filledForms || filledForms.length === 0) {
            return res.status(200).json([]);
        }

        if(filledForms[0].formCreator == req.userID){
            res.status(200).json(filledForms);
        }else{
            res.status(403).json({message:"unauthorized user"});
        }

    }
    catch(error){
        res.status(500).json({message:"an error occured", error: error.message});
    }
});

//Post form
router.post('/public', async (req,res) =>{
    try{
        const newForm = new FilledForms(req.body);

        const token = req.cookies.jwt;

        if (token){
            jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,async (err, decodedToken)=>{
                if(!err){
                    let user = await User.findById(decodedToken.id);
                    newForm.formSubmitter = user.name;
                    const savedForm = await newForm.save();
                    res.status(200).json(savedForm);
                }
            })
        }else{;
            newForm.formSubmitter = "Vendég";
            const savedForm = await newForm.save();
            res.status(200).json(savedForm);
        }
    }
    catch(error){
        console.log("error: "+ error)
        res.status(500).json({message:"an error occured", error: error});
    }
});

//Delete filledForm
router.delete('/:id',checkUser ,async (req,res) =>{
    try{
        const id = req.params.id
        const filledForm = await FilledForms.findOne({ _id : id });
        if (!filledForm) {
            return res.status(404).json({ message: "Form not found" });
        }
        if(filledForm.formCreator == req.userID){
            const deletedFilledForm = await FilledForms.deleteOne({_id : id})
            res.status(200).json(deletedFilledForm);
        }else{
            res.status(403).json({message:"unauthorized user"});
        }
    }
    catch(error){
        res.status(500).json({message:"an error occured", error: error});
    }
});

module.exports = router;