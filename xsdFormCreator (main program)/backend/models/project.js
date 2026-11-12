const mongoose = require("mongoose");

const projectSchema = mongoose.Schema(
    {
        name:{
            type: String,
            required: true,
        },
        schema:{
            type: String,
            required: true,
        },
        user:{
            type: String,
            required: true,
        },
        createdAt:{
            type: Date,
            default:() => Date.now()
        },
        updatedAt:{
            type: Date,
            default:() => Date.now()
        },
    }
);

const Project = mongoose.model('project',projectSchema);
module.exports = Project;