const express = require("express");
const hbs = require("express-handlebars");
const app = express();
const path = require("path");
const db = require("./db/connection");

const authorsController = require("./controllers/authors");
// const booksController = require("./controllers/books");
// const usersController = require("./controllers/users");

app.use(
  express.urlencoded({
    extended: false,
  })
);

app.engine(
  "hbs",
  hbs({
    extname: "hbs",
    defaultLayout: "layout",
    partialsDir: __dirname + "/views/partials",
    layoutsDir: __dirname + "/views/template",
  })
);

app.set("views", path.join(__dirname, "/views/"));
app.set("view engine", "hbs");
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

app.use("/", authorsController);
// app.use("/", booksController);
// app.use("/", usersController);

app.listen("3000");
