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

//PROJECT 30.09.2021
const express = require("express");
const { ExpressHandlebars } = require("express-handlebars");
const hbs = require("express-handlebars");
const app = express();
const path = require("path");
const db = require("./db/connection");

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

//ale routeris kuris paduos failus is node moduliu
app.use("/static", express.static("public"));

//kuriam route
app.get("/", (req, res) => {
  //   db.query("SHOW DATABASES", (err, resp) => {
  //     console.log(resp);
  //   });
  res.render("add-company");
});

app.get("/add-company", (req, res) => {
  res.render("add-company");
});

app.post("/add-company", (req, res) => {
  //cia is to ka suvedem pasiimam name
  let companyName = req.body.name;
  let companyAddress = req.body.address;
  //patikrinam ar ivestas name ir adresas jau yra duomenu bazej
  db.query(
    `SELECT * FROM companies WHERE name = '${companyName}'`,
    (err, resp) => {
      if (resp.length == 0) {
        db.query(
          //kreipiames i db. ir idedam duomenis '${companyName})' <- taip idedam kintamuosius
          `INSERT INTO companies (name, address) 
                    VALUES ( '${companyName}' , '${companyAddress}' )`,
          (err) => {
            if (err) {
              console.log(err);
              return;
            }

            res.redirect("/?m=Sėkmingai pridėjote įrašą");
          }
        );
      } else {
        res.redirect("/?m=Toks įrašas jau egzistuoja");
      }
    }
  );
});

app.listen("3000");
