const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");  
require('dotenv').config();


const app = express();

const PORT = process.env.PORT || 3000;
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL, // Your frontend URL
    credentials: true // Required for cookies
}));
app.use(express.json());

if (process.env.TRUST_PROXY === "true") {
    app.set("trust proxy", 1);
}

//Route the user api
const userRoutes = require("./routes/users");
app.use("/users",userRoutes);

//Route the project api
const projectRoutes = require("./routes/projects");
app.use("/projects",projectRoutes);

//Route the form api
const formRoutes = require("./routes/filledForms");
app.use("/filledForms",formRoutes);

main().catch((error) => console.log(error));

async function main() {
    await mongoose.connect(process.env.DATABASE_URL);
    mongoose.set("strictQuery", true);

    app.listen(PORT, (error) => {
    if(!error){
        console.log("Server listening at:",PORT)
    }else{
        console.log("An error occured",error);
    }
})
}