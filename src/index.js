const express = require("express");
const { engine } = require("express-handlebars");
const path = require("path");
const morgan = require("morgan");
const routes = require("./routes");
const db = require("./config/db");
const methodOverride = require('method-override')
const cookieParser = require('cookie-parser')
const paypal = require('paypal-rest-sdk');
const SortMiddleware = require('./app/middlewares/SortMiddleware')
const moment = require('moment-timezone'); //format date

const app = express();
const port = 3000;

// request flash
const flash = require('connect-flash');
const session = require('express-session');

app.use(session({ secret: '20112002', resave: true, saveUninitialized: true }));
app.use(flash());




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

app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));

app.use(morgan("combined"));

app.use(SortMiddleware)

app.engine(
  "hbs",
  engine({
    extname: ".hbs",
    helpers: {
      formatDate: function (date, timezone, format) {
        return moment(date).tz(timezone).format(format);
      },
      sum: (a, b) => a + b,
      multi: (a, b) => a * b,
      ifEquals: function (arg1, arg2, options) {
        // Chuyển đổi header của client thành header của admin
        return arg1 == arg2 ? options.fn(this) : options.inverse(this);
      },
      eachPage: function (page, maxPage, newUrl, options) {
        let result = '';

        var begin = page - 2
        if (begin < 1) {
          begin = 1
        }

        var end = page + 2
        if (end > maxPage) {
          end = maxPage
        }



        for (let i = begin; i <= end; i++) {
          // Chỉ định class "active" cho trang hiện tại
          const activeClass = i === page ? 'active' : '';

          if (newUrl) {
            currentPage = newUrl + `&page=${i}`
          } else {
            currentPage = `?page=${i}`
          }

          result += `<li class="page-item ${activeClass}"><a class="page-link" href="${currentPage}">${i}</a></li>`;
        }
        return result;
      },
      backPage: function (page, newUrl, options) {
        if (page > 1) {

          if (newUrl) {
            currentPage = newUrl + `&page=${page - 1}`
          } else {
            currentPage = `?page=${page - 1}`
          }

          result = `<li class="page-item">
                      <a class="page-link" href="${currentPage}" aria-label="Previous">
                          <span aria-hidden="true">&laquo;</span>
                          <span class="sr-only">Previous</span>
                      </a>
                  </li>`
        } else {
          result = ''
        }
        return result
      },
      nextPage: function (page, maxPage, newUrl, options) {
        if (page < maxPage) {

          if (newUrl) {
            currentPage = newUrl + `&page=${page + 1}`
          } else {
            currentPage = `?page=${page + 1}`
          }

          result = `<li class="page-item">
                      <a class="page-link" href="${currentPage}" aria-label="Next">
                          <span aria-hidden="true">&raquo;</span>
                          <span class="sr-only">Next</span>
                      </a>
                  </li>`
        } else {
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

      },
      //Xử lý phần trái tim đổi màu
      isInWishlist: function (shoeId, wishlistItems) {
        return wishlistItems.some(item => item.toString() === shoeId.toString());
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
