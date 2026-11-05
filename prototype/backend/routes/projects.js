const express = require("express");
const router = express.Router();
const Project = require("../models/project");
const {requireAuth, checkUser} = require("../middleware/authMiddleware")



//Get all project
/*
router.get('/', async (req,res) =>{
    try{
        const projects = await Project.find();
        res.status(200).json(projects);
    }
    catch(error){
        res.status(500).json({message:"an error occured", error: error});
    }
});*/

//Get by user project
router.get('/user',checkUser,async (req,res) =>{
    try{
        const projects = await Project.find({ user: req.userID });
        res.status(200).json(projects);
    }
    catch(error){
        res.status(500).json({message:"an error occured", error: error});
    }
});

//Get by id project
router.get('/:id',checkUser,async (req,res) =>{
    try{
        const id = req.params.id;
        const project = await Project.findOne({ _id : id });
        res.status(200).json(project);
    }
    catch(error){
        res.status(500).json({message:"an error occured", error: error});
    }
});


//Post new project
router.post('/',checkUser, async (req,res) =>{
    try{    
        const newProject = new Project(req.body);
        newProject.user = req.userID;
        const savedProject = await newProject.save();
        res.status(200).json(savedProject);
    }
    catch(error){
        res.status(500).json({message:"an error occured", error: error});
    }
});

//Put update project
router.patch('/patch/:id',checkUser ,async (req,res) =>{
    try{
        const id = req.params.id;
        const project = req.body;
        project.updatedAt = Date.now();
        const updatedProject = await Project.findOneAndUpdate(
            { _id : id },
            { $set : project},
            { new: true }
        );
        res.status(200).json(updatedProject);
    }
    catch(error){
        res.status(500).json({message:"an error occured", error: error});
    }
});

//Delete project
router.delete('/:id',checkUser ,async (req,res) =>{
    try{
        const id = req.params.id
        const project = await Project.findOne({ _id : id });
        if(project.user == res.userID){
            let deletedProject = await Project.deleteOne({_id : id})
            res.status(200).json(deletedProject);
        }else{
            res.status(503).json({message:"unauthorized user"})
        }
    }
    catch(error){
        res.status(500).json({message:"an error occured", error: error});
    }
});


module.exports = router;