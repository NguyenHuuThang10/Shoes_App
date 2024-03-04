const express = require("express");
const { engine } = require("express-handlebars");
const path = require("path");
const morgan = require("morgan");
const routes = require("./routes");
const app = express();
const port = 3000;
const db = require("./config/db");
const methodOverride = require('method-override')
var cookieParser = require('cookie-parser')

// READ COOKIE
app.use(cookieParser())



// Chuyển POST -> PUT, DELETE
app.use(methodOverride('_method'))

db.connect();

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.use(morgan("combined"));

app.engine(
  "hbs",
  engine({
    extname: ".hbs",
    helpers: {
      sum: (a, b) => a + b,
      ifEquals: function (arg1, arg2, options) {
        // Chuyển đổi header của client thành header của admin
        return arg1 == arg2 ? options.fn(this) : options.inverse(this);
      },
      
    },
  })
);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "resources", "views"));

// Chuyển đổi header của client thành header của admin
app.use((req, res, next) => {
  if (req.url.includes("/me")) {
    res.locals.headerType = "headerAdmin";
  } else {
    res.locals.headerType = "header";
  }
  next();
});

routes(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
