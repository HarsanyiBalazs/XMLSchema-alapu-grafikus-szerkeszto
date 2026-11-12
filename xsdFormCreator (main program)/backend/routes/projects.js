const express = require("express");
const router = express.Router();
const Project = require("../models/project");
const {checkUser} = require("../middleware/authMiddleware");



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
        if (!projects || projects.length === 0) {
            return res.status(200).json([]);
        }
        res.status(200).json(projects);
    }
    catch(error){
        res.status(500).json({message:"an error occured", error: error.message});
    }
});

//Get by id project
router.get('/:id',async (req,res) =>{
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
        // nem létezik
        if (!project) {
            return res.status(404).json({message: "project not found"});
        }
        //más felhasználó
        if (project.user.toString() !== req.userID.toString()) {
            return res.status(403).json({message: "unauthorized user"});
        }

        project.updatedAt = Date.now();
        const updatedProject = await Project.findOneAndUpdate(
            { _id : id },
            { $set : project},
            { returnDocument: 'after' }
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
        if (!project) {
            return res.status(404).json({ message: "project not found" });
        }
        if(project.user.toString() == req.userID.toString()){
            let deletedProject = await Project.deleteOne({_id : id})
            res.status(200).json(deletedProject);
        }else{
            res.status(403).json({message:"unauthorized user"});
        }
    }
    catch(error){
        res.status(500).json({message:"an error occured", error: error});
    }
});


module.exports = router;