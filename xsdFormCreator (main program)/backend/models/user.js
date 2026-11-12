const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
 
const UserSchema = mongoose.Schema(
    {
        name:{
            type: String,
            required: true,
            minlength: 4,
            unique: true,   
            lowercase:true
        },
        password:{
            type: String,
            required: true,
            minlength: 8,
        },
        createdAt:{
            type: Date,
            default:() => Date.now()
        },
        lastLogin:{
            type: Date,
            default:() => Date.now()
        }
    }
);

UserSchema.statics.login = async function(name,password){
    const user = await this.findOne({name:name.toLowerCase()});
    if (user){
        const auth = await bcrypt.compare(password,user.password);
        if (auth){
            return user;
        }else{
            throw Error('incorrect password');
        }
    }else{
        throw Error('incorrect name');     
    }
}


const User = mongoose.model('user',UserSchema);
module.exports = User;