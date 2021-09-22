/* 2021-09-20 */

// const connection =
require("./model");
const express = require("express");
const application = express();
const path = require("path");
const expressHandlebars = require("express-handlebars");
// const bodyparser = require("body-parser");

const irasaiController = require("./controllers/irasai");

application.use(
  express.urlencoded({
    extended: false,
  })
);

application.set("views", path.join(__dirname, "/views/"));

application.engine(
  "hbs",
  expressHandlebars({
    extname: "hbs",
    defaultLayout: "mainlayout",
    layoutsDir: __dirname + "/views/layouts",
  })
);

application.set("view engine", "hbs");

application.get("/", (req, res) => {
  res.render("index");
});
// application.get("/irasai", (req, res) => {
//   res.send("Irasu puslapis");
// });

application.use("/irasai", irasaiController);

application.listen("3000", () => {
  console.log("Serveris veikia");
});
