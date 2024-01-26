const express = require('express');
const routes = require('./routes/users.js');

const app = express();
const PORT =5000;

app.use(express.json()); //middleware

app.use("/user", routes);//uses routes to handle the endpoints which start with /user.

app.listen(PORT,()=>console.log("Server is running at port "+PORT));