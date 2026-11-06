const mongoose = require("mongoose");
const bycrypt = require("bcrypt");
 
const UserSchema = mongoose.Schema(
    {
        name:{
            type: String,
            required: [true,'Please enter an email'],
            minlength: [4,'Minimum username length is 4'],
            unique: true,   
            lowercase:true
        },
        password:{
            type: String,
            required: [true,'Please enter a password'],
            minlength: [8,'Minimum password length is 8']
        }
    }
);

UserSchema.statics.login = async function(name,password){
    const user = await this.findOne({name:name});
    if (user){
        const auth = await bycrypt.compare(password,user.password);
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