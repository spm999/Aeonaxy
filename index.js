const express = require('express');
const bodyParser = require('body-parser');
const db = require('./utils/db');
const cors = require('cors');
const router=require('./router.js');

const app = express();

app.use(router);
app.use(cors());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
    // Handle preflight requests
    if ('OPTIONS' === req.method) {
      res.sendStatus(200);
    } else {
      next();
    }
  });

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// login, signup route for Users///////////////////////////////////////////////////////////////////////

const Users = require('./routes/userRoutes.js');
app.use('/user', Users);

// //////////////////////////////////////////////////////////////////////////////////////////////////////

const SuperAdmin = require('./routes/superAdminRoute.js');
app.use('/superadmin', SuperAdmin);

// ////////////////////////////////////////////////////////////////////////////////////////////////////////

const Courses=require('./routes/courseRoute.js')
app.use('/courses', Courses)

// /////////////////////////////////////////////////////////////////////////////////////////////////////////

const CourseEnrollment=require("./routes/courseEnrollmentRoute.js")
app.use('/user', CourseEnrollment);


// /////////////////////////////////////////////////////////////////////////////////////////////////////////
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});