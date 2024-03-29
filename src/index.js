const express = require("express");
const { engine } = require("express-handlebars");
const path = require("path");
const morgan = require("morgan");
const routes = require("./routes");
const app = express();
const port = 3000;
const db = require("./config/db");
const methodOverride = require('method-override')
const cookieParser = require('cookie-parser')
const paypal = require('paypal-rest-sdk');
const SortMiddleware = require('./app/middlewares/SortMiddleware')

// READ COOKIE
app.use(cookieParser())


// PAYPAL
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AZe9yaajblSaLUL3BlLBgAxnTjp6aWIptRt3VoD4-ca0y5OzTS_wm5xQGgHBwRBYFAkTWVEvM1RuoPNk',
  'client_secret': 'EEqNHSQvmcwAeameZlFtEJ75w9Xumo8nL0ImnN8ktWqN3bMdDXXm2W9xK9mrHCR2HyHVpjmwoK3O9sZo'
});


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

app.use(SortMiddleware)

app.engine(
  "hbs",
  engine({
    extname: ".hbs",
    helpers: {
      sum: (a, b) => a + b,
      multi: (a, b) => a * b,
      ifEquals: function (arg1, arg2, options) {
        // Chuyển đổi header của client thành header của admin
        return arg1 == arg2 ? options.fn(this) : options.inverse(this);
      },
      eachPage: function (page, maxPage, options) {
        let result = '';

        var begin = page - 2
        if(begin < 1){
            begin = 1
        }

        var end = page + 2
        if(end > maxPage){
            end = maxPage
        }
        
        for (let i = begin; i <= end; i++) {
          // Chỉ định class "active" cho trang hiện tại
          const activeClass = i === page ? 'active' : '';
          result += `<li class="page-item ${activeClass}"><a class="page-link" href="?page=${i}">${i}</a></li>`;
        }
        return result;
      },
      backPage: function (page, options) {
        if (page > 1 ) {
          result = `<li class="page-item">
                      <a class="page-link" href="?page=${page - 1}" aria-label="Previous">
                          <span aria-hidden="true">&laquo;</span>
                          <span class="sr-only">Previous</span>
                      </a>
                  </li>`
        }else {
          result = ''
        }
        return result
      },
      nextPage: function (page, maxPage, options) {
        if (page < maxPage ) {
          result = `<li class="page-item">
                      <a class="page-link" href="?page=${page + 1}" aria-label="Next">
                          <span aria-hidden="true">&raquo;</span>
                          <span class="sr-only">Next</span>
                      </a>
                  </li>`
        }else {
          result = ''
        }
        return result
      },
      sortable: (field, sort) => {
        const sortType = field === sort.column ? sort.type : 'default'
  
        const icons = {
          default: 'fa-solid fa-sort',
          asc: 'fa-solid fa-arrow-down-short-wide',
          desc: 'fa-solid fa-arrow-down-wide-short'
        }
  
        const types = {
          default: 'desc',
          asc: 'desc',
          desc: 'asc'
        }
  
        const icon = icons[sortType]
        const type = types[sortType]
        return `<a href="?_sort&column=${field}&type=${type}">
                  <span class="${icon}"></span>
              </a>`
  
      }
      
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
