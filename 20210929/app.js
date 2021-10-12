//PROJECT 30.09.2021
const express = require("express");
const hbs = require("express-handlebars");
const app = express();
const path = require("path");
const db = require("./db/connection");
const companiesController = require("./controllers/companies");
const clientsController = require("./controllers/clients");

//express-session
const session = require("express-session");
//issaugos info i cookies kai mes prisijungiame // LOGIN
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

//be sitos eilutes mums nerodo surasyto duomenu i json
app.use(
  express.urlencoded({
    extended: false,
  })
);

//sukuriam template engine/ tai kas yra layout hbs eis per visus routes (1:00 val in paskaita)
app.engine(
  "hbs",
  hbs({
    extname: "hbs",
    //taip vadinas hbs failas template foderyje
    defaultLayout: "layout",
    //nuvedam iki layout
    layoutsDir: __dirname + "/views/template",
  })
);
//prieinam prie views failo,
app.set("views", path.join(__dirname, "/views/"));

//nustatom kad hbs engine bus naudojamas - priskiriam ji prie aplikacijos
app.set("view engine", "hbs");

app.use("/uploads", express.static("uploads"));

//ale routeris kuris paduos failus is node moduliu
app.use("/static", express.static("static"));

//bootstrap
app.use(
  "/static/css",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/css"))
);
app.use(
  "static.js",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/js"))
);

app.use("/", clientsController);
app.use("/", companiesController);

//kuriam route

app.get("/login", (req, res) => {
  res.render("login");

  console.log(req.session);
});

app.post("/login", (req, res) => {
  let user = req.body.email;
  let pass = req.body.password;

  if (user && pass) {
    db.query(
      `SELECT * FROM users WHERE email = '${user}' AND password = '${pass}'`,
      (err, user) => {
        if (!err && user.length > 0) {
          req.session.auth = true;
        }
      }
    );
  }

  res.send("Sekmingai prisijungete");
});

app.listen("3000");

//////////////////////////////////////////////////
//mySQL QUERIES

// const express = require("express");
// const app = express();
// const mysql = require("mysql");

// //prisijungimas pre mysql
// const db = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "myblog",
// });

// //prisijungimo paleidimas ir callback'as
// db.connect((err) => {
//   if (err) {
//     console.log("nepavyko");
//     return;
//   }
//   console.log("pavyko");
// });

//sukurti DB
// db.query("CREATE DATABASE myblog", (err, res) => {
//   if (err) console.log(err);
//   console.log(res);
// });

//priskirti DB. priskirti galime ir irasius database (10 eilute siame app.js)
// db.query("USE myblog", (err, res) => {
//   if (err) console.log(err);
//   console.log(res);
// });

// // db.query(`DROP TABLE IF NOT EXISTS`);
// db.query(
//   `CREATE TABLE IF NOT EXISTS irasai(
//     id int(9) NOT NULL AUTO_INCREMENT,
//     pavadinimas varchar(256),
//     turinys text,
//     PRIMARY KEY (id)
//     )AUTO_INCREMENT=1`,
//   (err, res) => {
//     if (err) console.log(err);
//     console.log(res);
//   }
// );
// db.query(
//   `INSERT INTO irasai (pavadinimas, turinys) VALUES ('Test pavadinimas3 ','Test tekstas3')`,
//   (err, res) => {
//     if (err) console.log(err);
//     console.log(res);
//   }
// );

// db.query(
//   `INSERT INTO irasai (pavadinimas, turinys) VALUES ('Test pavadinimas4','Test tekstas4')`,
//   (err, res) => {
//     if (err) console.log(err);
//     console.log(res);
//   }
// );

//DELETE
// db.query(`DELETE FROM irasai WHERE id=2`, (err, res) => {
//   if (err) console.log(err);
//   console.log(res);
// });

//parodyti visus lenteles elementus consolej
// ??????????

// db.query(
//   `SELECT id, pavadinimas, turinys FROM irasai WHERE turinys LIKE '%test%'`,
//   (err, res) => {
//     if (err) console.log(err);
//     console.log(res);
//   }
// );

// UPDATE
// db.query(
//   `UPDATE irasai SET pavadinimas='Pakeistas pavadinimas' WHERE id=1`,
//   (err, res) => {
//     if (err) console.log(err);
//     console.log(res);
//   }
// );

// db.query(
//   `UPDATE irasai SET id='2', turinys='Pakeistas turinys' WHERE id=3`,
//   (err, res) => {
//     if (err) console.log(err);
//     console.log(res);
//   }
// );

// DELETE all entries with id higher than 6
// db.query(`DELETE FROM irasai WHERE id>=4`, (err, res) => {
//   if (err) console.log(err);
//   console.log(res);
// });

//pakeisti ID eiliskuma

// db.query(`ALTER TABLE irasai AUTO_INCREMENT= 2`, (err, res) => {
//   if (err) console.log(err);
//   console.log(res);
// });
