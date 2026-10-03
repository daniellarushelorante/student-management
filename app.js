const express = require('express');
const mysql = require('mysql2');
const app = express();

const db = mysql.createConnection({
  host: 'localhost',
  port: 8889,          // use the MySQL port from MAMP (8889 or 3306)
  user: 'root',
  password: 'root',    // MAMP default
  database: 'student_management'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to MySQL');
});

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Student list
app.get('/', (req, res) => {
  db.query('SELECT * FROM students ORDER BY id DESC', (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Database error');
    }
    res.render('index', { students: results });
  });
});

// Show add form
app.get('/students/add', (req, res) => {
  res.render('add');
});

// Process add form
app.post('/students/add', (req, res) => {
  const { student_id, first_name, last_name, course, year_level, email } = req.body;

  const sql = `
    INSERT INTO students
    (student_id, first_name, last_name, course, year_level, email)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const values = [student_id, first_name, last_name, course, year_level, email];

  db.query(sql, values, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Unable to save student');
    }
    res.redirect('/');
  });
});

// Search students
app.get('/students/search', (req, res) => {
  const keyword = req.query.keyword || '';

  const sql = `
    SELECT * FROM students
    WHERE student_id LIKE ?
    OR first_name LIKE ?
    OR last_name LIKE ?
    OR course LIKE ?
  `;
  const searchValue = `%${keyword}%`;

  db.query(
    sql,
    [searchValue, searchValue, searchValue, searchValue],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Search error');
      }
      res.render('index', { students: results });
    }
  );
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});