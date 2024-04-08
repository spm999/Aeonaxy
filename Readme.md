# Node.js API for Learning Platform

This Node.js API is built with Express and NeonDB (PostgreSQL) for managing user authentication, course enrollment, and email sending functionalities. It utilizes JSON Web Tokens (JWT) for role-based token authentication.

## Features

* User management (creation, authentication)
* Superuser management
* Course management (creation, enrollment)
* Token-based authentication with JWT
* Email sending (resending feature)

## Database Schema

```
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_picture VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);CREATE TABLE courses (
    course_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    level VARCHAR(50),
    popularity INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);CREATE TABLE superadmins (
    superadmin_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_picture VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);CREATE TABLE user_enrollments (
    enrollment_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_course FOREIGN KEY (course_id) REFERENCES courses(course_id),
    CONSTRAINT unique_enrollment UNIQUE (user_id, course_id)
);
```


## Libraries

`npm install bcrypt body-parser cloudinary cors crypto-js dotenv express express-validator jsonwebtoken nodemon pg postgres resend `


## Getting Started

1. Clone the repository.
2. Install dependencies using `npm install`.
3. Set up your environment variables by creating a `.env` file based on `.env.example`.
4. Use given schema and create database on NeonDB.
5. Run the server using `npm start`.
6. The API should now be accessible at the specified port.

## API Endponits

### User Endpoints

1. **Register User** : `POST /user/register`
2. **Login User** : `POST /user/login`
3. **Update User** : `PUT /user/profile/:userId`
4. **Get User Details** : `GET /user/profile/:userId`

### Superadmin Endpoints

5. **Register Superadmin** : `POST /superadmin/register`
6. **Login Superadmin** : `POST /superadmin/login`
7. **Get Superadmin Details** : `GET /superadmin/profile/:superadminId`
8. **Update Superadmin Details** : `PUT /superadmins/profile/:superadminId`
9. **Add Course** : `POST /superadmin/courses`
10. **See Course detail** : `GET /superadmin/courses/:courseId`
11. **Update Course** : `PUT /superadmin/courses/:courseId`
12. **Delete Course** : `DELETE /superadmin/courses/:courseId`

### Course Enrollment Endpoints

1. **Enroll in Course** : `POST /user/:userId/enroll`
2. **See Enrolled Courses by User** : `GET /user/:userId/enrolled-courses`

### Courses

/courses?category=ITI: `Get use Query for category, level, limit`

## License

This project is licensed under the [MIT License]().
