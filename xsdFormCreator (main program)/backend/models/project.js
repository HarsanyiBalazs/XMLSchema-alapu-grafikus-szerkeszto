const mongoose = require("mongoose");

const projectSchema = mongoose.Schema(
    {
        name:{
            type: String
        },
        schema:{
            type: String,
        },
        user:{
            type: String,
            required: true,
            minlength: 4
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