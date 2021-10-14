const mysql = require("mysql");

//prisijungimas pre mysql
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "library",
});

//prisijungimo paleidimas ir callback'as
db.connect((err) => {
  if (err) {
    console.log("nepavyko");
    return;
  }
  console.log("pavyko");
});

module.exports = db;
