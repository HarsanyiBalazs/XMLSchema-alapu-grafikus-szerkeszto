const mongoose = require("mongoose");

const filledFormsSchema = mongoose.Schema(
    {
        schema:{
            type: String,
            required: true,
        },
        form:{
            type: String,
        },
        formCreator:{
            type: String,
            required: true,
        },
        formSubmitter:{
            type: String,
            minlength: 4
        },
        createdAt:{
            type: Date,
            default:() => Date.now()
        },
    }
);

const FilledForms = mongoose.model('filledForms',filledFormsSchema);
module.exports = FilledForms;