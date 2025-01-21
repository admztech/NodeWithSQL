const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require("express");
const app = express();
const path = require ("path");
const methodOverride = require("method-override");
const {v4: uuidv4} = require ("uuid");


app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'delta_app',
    password: 'Adnan@3230418'
  });

  let  getRandomUser = function () {
    return [
        faker.string.uuid(),
        faker.internet.username(), // before version 9.1.0, use userName()
        faker.internet.email(),
        faker.internet.password(),
    ];
};

  // try{
  //   connection.query(q, [data], (err,result)=>{
  //       if(err) throw err;
  //       console.log(result); // result retun in the arr form data and value are in objet form
  //     });
  // }catch(err){
  //   console.log(err);
  // }connection.end();

// Home route
  app.get("/",(req,res)=>{
    let q = `SELECT count(*) FROM user`;
    try{
      connection.query(q, (err, result)=>{
        if(err) throw err;
        let count = result[0]["count(*)"] ;
        res.render("home.ejs", {count});
      });
    }catch(err){
      console.log(err);
      res.send("some error in database");
    }
  });
  // SHOW Route
  app.get("/user",(req,res)=>{
    let q = `SELECT * FROM user`;
      try{
          connection.query(q, (err, users)=>{
            if(err) throw err;
            res.render('show.ejs', {users})
          });
      }catch(err){
        console.log(err);
        res.send("database erro")
      }
  });
 

// Edite Route
app.get("/user/:id/edit", (req, res)=>{
  let {id} = req.params;
  let q = `SELECT * FROM user WHERE id = '${id}'`;

    try{
      connection.query(q, (err,result)=>{
        if(err) throw err;
        let user = result[0]
        console.log(result);
        res.render("edit.ejs", {user});
      });
    }catch(err){
      console.log(err);
      res.send("Database Error")
    }
});
// Update Route
app.patch("/user/:id", (req, res) => {
  let {id} = req.params;
  let {username: newUSername, password: formPass} = req.body;
  let q = `SELECT * FROM user WHERE id = "${id}"`;
  try{
      connection.query(q, (err, result)=> {
        if(err) throw err;
        let user = result[0];
        if(formPass != user.password){
          res.send("Wrong pasword");
        } else{
          let  q2 = `UPDATE user SET username = "${newUSername}" WHERE id = '${id}' `;
          connection.query(q2, (err, result)=>{
            {
              if(err) throw err;
              res.redirect("/user");
            }
          });
        }
      });
  }catch(err){
    console.log(err);
    res.send("Some error in BD");
  }
});
 //New user route
 app.get("/user/new", (req, res)=>{
  res.render('new.ejs');
});

// Added new user 
app.post("/user/new", (req,res)=>{
  console.log(req.body);
  let { email, username, password} = req.body;
  let id = uuidv4() ;
  let q = `INSERT INTO user (id, username, email, password) VALUE ('${id}','${username}','${email}','${password}')`;
  try{
    connection.query(q,(err,result)=>{
      if(err) throw err;
      console.log("added new user");
      res.redirect("/user");

    });
  }catch(err){
    console.log(err);
    res.send("Some error occured");
  }
});
// Delete Route
app.get("/user/:id/delete", (req, res)=>{
  let {id} = req.params;
  let q = `SELECT * FROM user WHERE id = '${id}'`;
  try{
    connection.query(q, (err, result)=>{
      if(err) throw err;
      let user = result[0];
      console.log(user);
      res.render('delete.ejs', {user});
    });
  }catch(err){
    console.log(err);
    res.send("Some error ocured");
  }
});
// Delete User
app.delete('/user/:id', (req, res)=>{
  let {id} = req.params;
  let {email, password} = req.body;
  let q = `SELECT * FROM user WHERE id = '${id}'`;
  try{
    connection.query(q, (err,result)=>{
      if(err) throw err;
      let user = result[0];
      if(user.email!=email || user.password != password){
        res.send("WRONG passowrd or Email");
      }else {
        let q2 = `DELETE FROM user WHERE id = '${id}'`;
        connection.query(q2, (err, result)=>{
          if (err) throw err;
          else{
            console.log(result);
            console.log("delete!");
              res.redirect("/user");
          }
        });
      }
      
    });
  }catch(err){
    console.log(err);
    res.send("Some error occur");
  }

});
  app.listen("8080", ()=>{
    console.log("server is listening on port 8080");
  });