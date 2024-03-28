import express from "express";

const app=express();



app.get("/jk",(req,res)=>{
    const schools = [
        {
            name: "Central High School",
            location: "123 Main Street, Cityville",
            studentsCount: 1200,
            teachersCount: 80,
            principal: "Ms. Smith"
        },
        {
            name: "Westside Elementary",
            location: "456 Elm Avenue, Townsville",
            studentsCount: 500,
            teachersCount: 30,
            principal: "Mr. Johnson"
        },
        {
            name: "Eastwood Middle School",
            location: "789 Oak Boulevard, Villagetown",
            studentsCount: 800,
            teachersCount: 50,
            principal: "Mrs. Davis"
        }
    ];
    res.send(schools)
})

app.listen(8000,()=>{
    console.log("Port is running on 8000")
})