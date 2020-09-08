const express = require('express');
const router = express.Router();
const Joi = require('joi');
//============= db =============
const mongoose = require('mongoose');
const coursesdb = require('../db/courses.js');
const URI = 'mongodb://localhost:27017/MyUdemy';
mongoose.connect(URI)
.then(()=>console.log('connected to mongodb'))
.catch((err)=>console.log(`can't connect` , err.message));
let courses=[
    {id:1 , name:"c1"},
    {id :2 , name:"c2"}
];

///get all courses
router.get('/',(req , res)=>{
    coursesdb.findAll().then((result)=>res.send(result));
    // res.send(courses);
});
///add course to courses
router.post('/' , (req,res)=>{
    const {error, value} = validateCourse(req.body); ///return object has error and result
    ///if error is null then validated and will proceed
    if(!error){
        const course = {
            name: req.body.name ,
            tags: req.body.tags
        };
        coursesdb.add(course).
        then(
            (result)=>res.send(result)
        ).catch(
            (err)=>{
                res.status(400).send(err.message);
            }
        )
    }
    else{
        ///else in we have error object and details array 
        /// we map all messages from details array in an array to send to user
        const error_array = error.details.map((e)=>e.message)
        console.log(error_array);
        res.status(400).send(error_array);
    }
    // console.log(result);
});
/// api/courses/1
///ge course by id
router.get('/:id',(req,res)=>{
    console.log(req.params.id);
    const ret = courses.find((course)=> course.id == req.params.id);
    if(!ret){
        res.status(404).send(`the course with the given id can't be found `);
        
    }
    else {
        res.send(ret);
    }
    // console.log(ret);
});
/// to update course
router.put('/:id',(req,res)=>{
    // look up the course if not found return 404  not found
    const id = req.params.id;
    const course = courses.find((course)=> course.id == req.params.id);
    if(!course){
        res.status(404).send("not found");
        return ;
    }

    //validate 
    //if invalid return 400 - bad request
    const {error, value} =validateCourse(req.body); ///return object has error and result

    if(error){
        const error_array = error.details.map((e)=>e.message)
        console.log(error_array);
        res.status(400).send(error_array);
        return ;
    }
    // update and return the updated course
    course.name = req.body.name;
    res.send(course);
    return ;
});
/// to delete course by id
router.delete('/:id',(req , res)=>{
    const course = courses.find((course)=> course.id == req.params.id);
    if(!course){
        res.status(404).send("not found");
        return ;
    }
    const indx = courses.indexOf(course);
    courses.splice(indx,1);
    res.send(course);
    return;

});
//utilites
function validateCourse(course){
    const schema = Joi.object({
        name : Joi.string().min(3).required(),
        tags:Joi.array()
    });
    return schema.validate(course);
}
module.exports = router ;