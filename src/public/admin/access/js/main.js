document.addEventListener('DOMContentLoaded', function () {
    // Lấy đường dẫn URL hiện tại
    const currentUrl = window.location.pathname;
    const navProduct = document.querySelector('.nav-product')
    const navUser = document.querySelector('.nav-user')
    const navOrder = document.querySelector('.nav-order')
    const navBlog = document.querySelector('.nav-blog')
    const navPage = document.querySelector('.nav-page')

    const createProduct = document.querySelector('a[href="/me/create/shoes"]')
    const storedProduct = document.querySelector('a[href="/me/stored/shoes"]')

    const createUser = document.querySelector('a[href="/me/create/users"]')
    const storedUser = document.querySelector('a[href="/me/stored/users"]')

    const storedOrder = document.querySelector('a[href="/me/stored/orders"]')

    const createBlog = document.querySelector('a[href="/me/create/blogs"]')
    const storedBlog = document.querySelector('a[href="/me/stored/blogs"]')

    const createPage = document.querySelector('a[href="/me/create/pages"]')
    const storedPage = document.querySelector('a[href="/me/stored/pages"]')


    // Lấy phần cuối cùng của URL
    const urlSegments = currentUrl.split('/');
    const lastSegment = urlSegments.pop();  // lấy phần cuối cùng
    const secondLastSegment = urlSegments.pop();

    if (lastSegment === 'shoes') {
      navProduct.classList.add('menu-open');

      if (secondLastSegment === 'create') {
        createProduct.classList.add('active')
      } else if (secondLastSegment === 'stored') {
        storedProduct.classList.add('active')
      }

    } else if (lastSegment === 'users') {
      navUser.classList.add('menu-open');

      if (secondLastSegment === 'create') {
        createUser.classList.add('active')
      } else if (secondLastSegment === 'stored') {
        storedUser.classList.add('active')
      }
    } else if (lastSegment === 'orders') {
      navOrder.classList.add('menu-open');

      if (secondLastSegment === 'stored') {
        storedOrder.classList.add('active')
      }
    } else if (lastSegment === 'blogs') {
      navBlog.classList.add('menu-open');

      if (secondLastSegment === 'create') {
        createBlog.classList.add('active')
      } else if (secondLastSegment === 'stored') {
        storedBlog.classList.add('active')
      }
    } else if (lastSegment === 'pages') {
      navPage.classList.add('menu-open');

      if (secondLastSegment === 'create') {
        createPage.classList.add('active')
      } else if (secondLastSegment === 'stored') {
        storedPage.classList.add('active')
      }
    }



  });