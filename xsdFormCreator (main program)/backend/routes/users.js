const express = require("express");
const router = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bycrypt = require("bcrypt");
require('dotenv').config();
const { checkForCookie } = require("../middleware/authMiddleware");


const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = { name: "", password: "" };

    //duplicate error code
    if (err.code === 11000) {
        errors.name = 'Ez a felhasználónév már foglalt.';
        return errors;
    }

    //validation errors
    if (err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        })
    }

    return errors;
};

const maximumAge = 3 * 24 * 60 * 60;

const createToken = (id) => {
    return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: maximumAge
    });
};

const cookieOptions = {
    httpOnly: true,
    maxAge: maximumAge * 1000,
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
                message: "Password must be at least 8 characters long"
            });
        }

        const salt = await bycrypt.genSalt();
        newUser.password = await bycrypt.hash(newUser.password, salt);
        const savedUser = await newUser.save();
        const token = await createToken(savedUser._id);
        await res.cookie("jwt", token, cookieOptions);
        res.status(201).json({ user: savedUser._id });
    }
    catch (error) {
        const errors = handleErrors(error);
        res.status(400).json({ errors });
    }
});


//Post login to give token

router.post('/login', async (req, res) => {
    const loginUser = await new User(req.body);
    try {
        const user = await User.login(loginUser.name, loginUser.password);
        const token = await createToken(user._id);
        await res.cookie("jwt", token, cookieOptions);
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

//Get userID

router.get('/user', checkForCookie, async (req, res) => {
    try {
        const token = req.userID;

        if (token) {
            res.status(200).json({ user: req.userID });
        } else {
            //401 not logged in 403 no permission
            res.status(200).json({ user: null });
        }

    }
    catch (error) {
        res.status(200).json({ user: null });
    }
});

module.exports = router;