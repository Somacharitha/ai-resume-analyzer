# AI Resume Analyzer

A full-stack web application that analyzes resumes and provides skill insights and job role recommendations.

## Features

* User authentication (Signup & Login)
* Upload resume (PDF)
* Extract skills from resume
* Analyze resume content
* Recommend suitable job roles
* Dashboard with analysis results

## Tech Stack

Frontend:

* HTML
* CSS
* JavaScript

Backend:

* Node.js
* Express.js

Database:

* PostgreSQL

Libraries:

* multer
* pdf-parse
* bcrypt
* jsonwebtoken
* dotenv

## Project Structure

backend/

* routes
* controllers
* middleware
* services
* database

frontend/

* index.html
* login.html
* signup.html
* upload.html
* dashboard.html
* static/

## How to Run the Project

1. Clone the repository

```
git clone https://github.com/Somacharithra/ai-resume-analyzer.git
```

2. Install dependencies

```
cd backend
npm install
```

3. Run the backend server

```
node server.js
```

4. Open frontend

Open `frontend/index.html` in your browser.

## Future Improvements

* AI-powered resume feedback
* Resume score prediction
* Job matching using ML
* Deployment with cloud hosting
