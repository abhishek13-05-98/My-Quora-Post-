const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require('express');
const app = express();
const ejs = require('ejs');
const port = 8000;
const path = require('path');
const methodOverride = require('method-override');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '8178',
    database: 'quora'

});
let randomid = ()=> {
    return [
   faker.image.avatar(),
    faker.internet.username(),
    faker.internet.email(),
    faker.internet.password(),

   
    ]
  };
  
//   const insertQuery = 'INSERT INTO quoradata (img, id, email, comment) VALUES (?, ?, ?, ?)'; 

//     for (let i = 0; i <= 100; i++) {
//  connection.query(insertQuery, randomid(), (err, result) => {
//     console.log(result);
 
// });
    // }
app.get('/', (req, res) => {
    let show = "SELECT COUNT(*) as total FROM quoradata";
    connection.query(show, (err, result) => {
        if (err) {
            console.log(err);
            return res.send("Database Error");
        }

        let total = result[0].total;
        res.render("index.ejs", { total });
    });
});

app.get('/users', (req, res) => {
    let q = `SELECT * FROM quoradata`;
    connection.query(q, (err, users) => {
        if (err) {
            return res.send("Database Error");
        }
        res.render("user.ejs", { users});
    });
});

app.get('/edit/:id/:verify', (req, res) => {
    let userid = req.params.id;
    let q = `SELECT * FROM quoradata WHERE ID = '${userid}'`;
     connection.query(q, (err, result) => {
        let user = result[0];
        res.render("verify.ejs", { user });
     })
});

app.get('/edit/:id', (req, res) => {
    let userid = req.params.id;
    let q = `SELECT * FROM quoradata WHERE ID = '${userid}'`;
     connection.query(q, (err, result) => {
         try {
         if (err) {
             return res.send("Database Error");
         }
        let user = result[0];
         res.render("edit.ejs", {user});
       } catch (error) {
         console.error('Error occurred:', error);
         }
        
    });
   });

   app.patch("/users/:id", (req, res) =>{
   let userid = req.params.id;
   let {comment: newcomment, id: newid, email: newemail} = req.body;
   let q = `SELECT * FROM quoradata WHERE ID = '${userid}'`;
   connection.query(q, (err, result) =>{
        let user = result[0];
         let q2 = `
            UPDATE quoradata
            SET id = ?, email = ?, comment = ?
            WHERE id = ?
        `;

        connection.query(
            q2,
            [newid, newemail, newcomment, userid],
            (err, result) => {

                if (err) {
                    console.log("UPDATE ERROR:", err);
                    return res.send("Update failed");
                }

                console.log(result);
                res.redirect("/users");
        })
    
    })
   })

   app.get('/delete/:id', (req, res) => {
    let userid = req.params.id;
    let q = `SELECT * FROM quoradata WHERE ID = '${userid}'`;
    connection.query(q, (err, result) =>{
        let user = result[0];
        res.render("deleteuser.ejs", { user });
    })
   });

   app.put('/delete/:id/verify', (req, res) => {
    let userid = req.params.id;
    let { password: userpassword } = req.body;
    let q = `select * from quoradata where ID = '${userid}'`;
    connection.query(q, (err, result) => {
        let user = result[0];
  if (userpassword !== user.password) {
            res.render("wrongpassword.ejs");
        }
        else {
        let q2 = `DELETE FROM quoradata WHERE ID = '${userid}' AND password = '${userpassword}'`;
     connection.query(q2, (err, result) => {
        res.redirect ("/users")
     })
    }
    });
    });
    app.post('/adduser', (req, res) => {
       res.render("adduser.ejs");
     });


app.put('/users',(req, res) => {

  let { img: newimg, id: newid, email: newemail, comment: newcomment, password: newpassword} = req.body;
    let q = `INSERT INTO quoradata (img, id, email, comment, password) VALUES ('${newimg}', '${newid}', '${newemail}', '${newcomment}', '${newpassword}')`;

  connection.query(q, (err, result) => {

        if (err) {
            console.error('Error occurred while adding user:', err);
            return res.send("Database Error");
    }
    
    res.redirect('/users');

}); 
 });
app.listen(8000, () => {    
    console.log('Server is running on port 8000');
});

