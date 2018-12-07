require('dotenv').config()


const express = require('express');
const app = express();
var bodyParser = require('body-parser');
var mysql = require('mysql');

app.use(express.json());
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;

//ESTABLISH CONNECTION
const con = mysql.createConnection({
  host: process.env.HOST || "localhost",
  user: process.env.USER || "root",
  database: process.env.DB || "poll"
});

//HOMEPAGE
app.get('/', (req, res) => {
  res.send('Hello!');
});

//GET THEMEID
app.get('/theme/:themeid', (req, res) => {
  if (isNaN(req.params.themeid)) {
    res.status(500).send('Internal server error');
  }
  con.query("SELECT * FROM theme WHERE id = ?", [req.params.themeid], (err, rows, fields) => {
    if (err) {
      console.log('query failed');
      res.sendStatus(500);
      res.end();
    };
    res.json(rows);
  })
})

// ADD NEW THEME
app.post('/theme', (req, res) => {
  if (req.body.name.length > 1024) {
    // 400
    res.status(400).send({'themeid': req.params.themeid, 'error': 'Name length cannot be greater than 1024 characters'});
  }
  else {
    con.query("INSERT into theme(name, yes, no) values(?, 0, 0)", [req.body.name])
    res.send({
      'error': null,
      'themeid': req.body.name
    })
  }
});


//VOTE FOR 'YES' 
app.post('/theme/:themeid/yes', (req, res) => {
  con.query("UPDATE theme set yes = yes + 1 WHERE id = ?", [req.params.themeid], (err, rows, fields) => {
    if (err) {
      console.log('failed to vote');
      res.sendStatus(500);
      res.end();
    }
    res.send('OK');
  })
});



//VOTE FOR 'NO'
app.post('/theme/:themeid/no', (req, res) => {
  con.query("UPDATE theme set no = no + 1 WHERE id = ?", [req.params.themeid], (err, rows, fields) => {
    if (err) {
      console.log('failed to vote');
      res.sendStatus(500);
      res.end();
    }
  res.send('OK');
  })
});


app.listen(port, () => {
  console.log('listening to port ' + port);
})
