const jwt = require('jsonwebtoken');
require('dotenv').config();


/*const requireAuth = (req,res,next) =>{
    const token = req.cookies.jwt;

    //check json web token exists and verified
    if (token){
        jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err, decodedToken)=>{
            if(err){
                console.log(err.message);
                throw Error("401");
            }else{
                console.log(decodedToken)
                next();
            }
        })
    }else{
        //401 not logged in 403 no permission
        return res.status(401).json({error: "Unauthorized"});
    }
}*/

const checkUser = (req,res,next) =>{
    const token = req.cookies.jwt;
    
    if (token){
        jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,async (err, decodedToken)=>{
            if(err){
                console.log(err.message);
                return res.status(401).json({ error: "Unauthorized2" });
            }else{
                //console.log(decodedToken)
                req.userID = decodedToken.id;
                next();
            }
        })
    }else{
        //401 not logged in 403 no permission
        return res.status(401).json({ error: "Unauthorized no token" });
    }   
}


const checkForCookie = (req, res, next) => {
    const token = req.cookies.jwt;
    console.log("token:", token);
    
    if (!token) {
        req.userID = null;
        return next(); // Must proceed so the route handler can return { user: null }
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decodedToken) => {
        if (err) {
            console.log(err.message);
            req.userID = null;
            return next();
        } else {
            req.userID = decodedToken.id;
            next();
        }
    });
};

module.exports = {checkForCookie,checkUser};