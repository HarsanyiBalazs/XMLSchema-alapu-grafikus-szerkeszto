const Project = require("../models/project");

module.exports.project_get = async (req,res) =>{
    try{
        const projects = await Project.find();
        res.status(200).json(projects);
    }
    catch(error){
        res.status(500).json({message:"an error occured", error: error});
    }
}

module.exports.project_getById = async (req,res) =>{
    try{
        const id = req.params.id;
        const project = await Project.findOne({ _id : id });
        res.status(200).json(project);
    }
    catch(error){
        res.status(500).json({message:"an error occured", error: error});
    }
}

module.exports.project_getByUser = async (req,res) =>{
    try{
        const user = req.params.user;
        const projects = await Project.find({ user : user });
        res.status(200).json(projects);
    }
    catch(error){
        res.status(500).json({message:"an error occured", error: error});
    }
}

module.exports.project_post = async (req,res) =>{
    try{
        const newProject = new Project(req.body);
        const savedProject = newProject.save();
        res.status(200).json(savedProject);
    }
    catch(error){
        res.status(500).json({message:"an error occured", error: error});
    }
}

module.exports.project_put = async (req,res) =>{
    try{
        const id = req.params.id
        const project = req.body;
        const updatedProject =  project.findOneAndUpdate(
            { _id : id },
            { $set : user},
            { new: true }
        );
        res.status(200).json(updatedProject);
    }
    catch(error){
        res.status(500).json({message:"an error occured", error: error});
    }
}

module.exports.project_delete = async (req,res) =>{
    try{
        const id = req.params.id
        let deletedProject = await Project.deleteOne({_id : id})
        res.status(200).json(deletedProject);
    }
    catch(error){
        res.status(500).json({message:"an error occured", error: error});
    }
}
