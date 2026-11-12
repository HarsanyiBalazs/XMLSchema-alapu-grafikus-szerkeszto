const express = require("express");
const router = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require('dotenv').config();


const maximumAge = 3 * 24 * 60 * 60; //3 nap

const createToken = (id) => {
    return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: maximumAge
    });
};

const cookieOptions = {
    httpOnly: true,
    maxAge: maximumAge * 1000, //in milliseconds so have to multiply by 1000 to be the same as the token
    secure: true,
    sameSite: "lax",
    path: "/",
};

//Post signup

router.post('/signup', async (req, res) => {
    try {
        const newUser = await new User(req.body);

        if (!newUser.password || newUser.password.length < 8) {
            return res.status(400).json({
                message: "A jelszónak legalább 8 karakterhosszúnak kell lennie"
            });
        }

        const salt = await bcrypt.genSalt();
        newUser.password = await bcrypt.hash(newUser.password, salt);
        const savedUser = await newUser.save();
        const token = await createToken(savedUser._id);
        await res.cookie("jwt", token, cookieOptions);
        res.status(201).json({ user: savedUser._id });
    }
    catch (error) {

        //duplicate error code
        if (error.code === 11000) {
            res.status(400).json({ message: 'Ez a felhasználónév már foglalt.' }); 
        }else{
            res.status(400).json({ message: 'Nem sikerült a regisztráció.' }); 
        }

    }
});


//Post login to give token

router.post('/login', async (req, res) => {
    const loginUser = await new User(req.body);
    try {
        const user = await User.login(loginUser.name, loginUser.password);
        const token = await createToken(user._id);
        await res.cookie("jwt", token, cookieOptions);
        user.lastLogin = Date.now();
        await User.findOneAndUpdate(
            { _id : user._id },
            { $set : user}
        );
        res.status(200).json({ user: user._id });
    }
    catch (error) {
        res.status(400).json({ message: "Invalid username or password" });
    }
});

//Post logout

router.post('/logout', async (req, res) => {
    try {
        res.clearCookie("jwt", {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            path: "/",
        });
        res.status(200).json({ message: "Successfull logout" });
    }
    catch (error) {
        res.status(400).json({ message: "an error with logging out " });
    }
});

//Get wheter or not some is logged in

router.get('/user', async (req, res) => {
    try {
        const token = req.cookies.jwt;        

        if (token) {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decodedToken) => {
                if (err) {
                    console.log(err.message);
                    res.status(200).json({ loggedIn: false });
                } else {
                    res.status(200).json({ loggedIn: true });
                }
            });
        } else {
            res.status(200).json({ loggedIn: false });
        }

    }
    catch (error) {
        res.status(200).json({ loggedIn: false });
    }
});

module.exports = router;