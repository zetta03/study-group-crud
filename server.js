const express = require('express'); // get express from modules
const app = express(); // create application from express
const mongoose = require('mongoose'); // get mongoose from modules
const PORT = 8080; // port for express to listen on
const DB_CONNECTION = 'mongodb://localhost:27017/students'; // <dbname>:students
// add model Student
let Student = require('./models/student');

// connect to the database
mongoose.connect(DB_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}); // attemp to connect to the database

const connection = mongoose.connection; // we get the connection object from mongoose

// everytime there is an error on mongoose it will log on the console
connection.on('error', error => console.log(`Mongo connection error: ${error}`));
// log on the console once the connection is open
connection.once('open', () => console.log('MongoDB database connection established succesfully.'));

// boilerplate express server
app.use(express.urlencoded({extended: true})); 
app.use(express.json()); // specify that we are using json objects to request and response

// define public folder
app.use('/' /* route */ , 
        express.static('public') /* folder to expose */);

// routes 
/*        
    /students/      get post
    /students/:id   get put delete   
*/
app.get('/students', (request, response) => {
    Student.find((error /* error message if there was an error*/
                , result /* result from search */) => {
        if(error) { // if error is not empty send error message
            response.status(400).json({
                message: 'Data was not found',
                error: error.message
            });
        } else { // if there was no error return result
            response.json(result);
        }
    });
});

app.post('/students', (request, response) =>  {
    // new instance of model Student
    let student = new Student(request.body);    
    // insert document into the collection
    student.save()// attempts to save into the database
        .then(() => { // successful saving
            response.json({ // respond to the client with a success message
                success: true // this can be anything
            });
        })
        .catch(error => { // couldn't be save
            console.log(error); // log in the console
            response.status(400).json({ // respond to the client with a failure message
                success: false, // this can be anything
                error: error.message
            });
        });
});

// /students/:id
app.get('/students/:id', (request, response) => {
    const id = request.params.id; // get parameter id from request
    Student.findById( // search by id in model Student
        id, // id to search for
        (error, result) => { // callback with error or result
            if(error) { // there is an error
                response.status(400); // status = 400
                response.json({ // Display error message
                    message: 'Data was not found.',
                    error: error.message
                })
            } else {
                response.json(result); // Display document found
            }
        }
    )
});

// start server
// last method to execute
app.listen(PORT, () => console.log(`Express server listening on port ${PORT}`));