const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");  
require('dotenv').config();


const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL, // Your frontend URL
    credentials: true // Required for cookies
}));
app.use(express.json());
app.use(cookieParser());

const PORT = 3000;

//Route the user api
const userRoutes = require("./routes/users");
app.use("/users",userRoutes);

//Route the project api
const projectRoutes = require("./routes/projects");
app.use("/projects",projectRoutes);

//Route the form api
const formRoutes = require("./routes/filledForms");
app.use("/filledForms",formRoutes);

app.listen(PORT, (error) => {
    if(!error){
        console.log("Server listening at:",PORT)
    }else{
        console.log("An error occured",error);
    }
})

main().catch((error) => console.log(error));

async function main() {
    const connectionString =  process.env.DATABASE_URL;
    await mongoose.connect(connectionString);
    mongoose.set("strictQuery", true);
}