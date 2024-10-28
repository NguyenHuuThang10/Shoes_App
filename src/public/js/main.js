document.addEventListener("DOMContentLoaded", function () {
    // sroll header
    // var prevScrollpos = window.scrollY;
    // window.onscroll = function () {
    //     var currentScrollPos = window.scrollY;
    //     if (prevScrollpos > currentScrollPos) {
    //         if (currentScrollPos != 0) {
    //             document.getElementById("navbar").style.top = "0px";
    //         } else {
    //             document.getElementById("navbar").style.top = "39px";
    //         }
    //     } else {

    //         document.getElementById("navbar").style.top = "-114px";
    //     }
    //     prevScrollpos = currentScrollPos;
    // }
    var prevScrollpos = window.scrollY;
    window.onscroll = function () {
        var currentScrollPos = window.scrollY;

        // Kiểm tra nếu màn hình nhỏ hơn 1024px (mobile và tablet)
        if (window.innerWidth < 1024) {
            if (prevScrollpos > currentScrollPos) {
                // Khi cuộn lên
                if (currentScrollPos !== 0) {
                    document.getElementById("navbar").style.top = "0px";
                } else {
                    document.getElementById("navbar").style.top = "0px"; // Nếu ở đầu trang thì đặt lại 0px
                }
            } else {
                // Khi cuộn xuống
                document.getElementById("navbar").style.top = "-114px";
            }
        } else {
            // Đối với màn hình lớn hơn hoặc bằng 1024px
            if (prevScrollpos >= currentScrollPos) {
                // Khi cuộn lên
                if (currentScrollPos !== 0) {
                    document.getElementById("navbar").style.top = "0px";
                } else {
                    document.getElementById("navbar").style.top = "39px"; // Nếu ở đầu trang thì đặt lại 39px
                }
            } else {
                // Khi cuộn xuống
                document.getElementById("navbar").style.top = "-114px";
            }
        }

        prevScrollpos = currentScrollPos;
    }



    // slideshow đầu trang
    var image = document.getElementById('image');
    var images = [
        '/img/mwc.jpg',
        '/img/mwc1.jpg'
    ];
    var currentIndex = 0;

    function changeImage() {
        image.src = images[currentIndex];
        currentIndex = (currentIndex + 1) % images.length;
    }

    setInterval(changeImage, 3000);

    /* slideshow cuối trang */
    var image1 = document.getElementById('image1');
    var images1 = [
        '/img/mwc3.jpg',
        '/img/mwc4.jpg'
    ];
    var currentIndex1 = 0;

    function changeImage1() {
        image1.src = images1[currentIndex1];
        currentIndex1 = (currentIndex1 + 1) % images1.length;
    }

    setInterval(changeImage1, 3000);

    // xử lý phần trái tim
    // var hearts = document.querySelectorAll('.heart');

    // hearts.forEach(function (heart) {
    //     heart.addEventListener('click', function () {
    //         heart.classList.toggle('active'); // Chuyển đổi giữa trạng thái có class 'active' và không có
    //     });
    // });

    const selectElement = document.getElementById('category');
    const shoeContainer = document.getElementById('shoeContainer');

    function sortByPrice(order) {
        const shoes = Array.from(shoeContainer.children);

        shoes.sort((a, b) => {
            const priceA = parseInt(a.querySelector('p').textContent.replace('.000 đ', '').trim());
            const priceB = parseInt(b.querySelector('p').textContent.replace('.000 đ', '').trim());

            if (order === 'Down' || order === 'Up') {
                return order === 'Down' ? priceB - priceA : priceA - priceB;
            } else if (order === 'AZ' || order === 'ZA') {
                const nameA = a.querySelector('b').textContent.toLowerCase();
                const nameB = b.querySelector('b').textContent.toLowerCase();

                if (order === 'AZ') {
                    return nameA.localeCompare(nameB);
                } else {
                    return nameB.localeCompare(nameA);
                }
            }
        });

        shoeContainer.innerHTML = '';
        shoes.forEach(shoe => {
            shoeContainer.appendChild(shoe);
        });
    }

    selectElement.addEventListener('change', function () {
        const selectedOption = this.value;
        if (['Down', 'Up', 'AZ', 'ZA'].includes(selectedOption)) {
            sortByPrice(selectedOption);
        }
    });

    // Xứ lý phần form search trang shoe type
    const searchForm = document.querySelector('.form-search');
    const shoeItems = document.querySelectorAll('.img');
    const originalOrder = Array.from(shoeItems);

    function filterShoes(keyword) {
        const lowerKeyword = keyword.toLowerCase();
        shoeContainer.innerHTML = '';

        let foundShoes = false;

        originalOrder.forEach(shoe => {
            const shoeNameLower = shoe.querySelector('b').textContent.toLowerCase();
            const shoeName = shoe.querySelector('b').textContent;
            const shoeImgSrc = shoe.querySelector('img').getAttribute('src');
            const shoePrice = shoe.querySelector('p').textContent.trim();
            const shoeLink = shoe.querySelector('a').getAttribute('href');

            if (shoeNameLower.includes(lowerKeyword)) {
                foundShoes = true;

                // Tạo lại cấu trúc sản phẩm khớp với cấu trúc gốc
                const colDiv = document.createElement('div');
                colDiv.classList.add('col-md-2', 'mt-4');

                const imgDiv = document.createElement('div');
                imgDiv.classList.add('img');
                imgDiv.style.border = "solid #e6e6e6 1px";

                const imgLink = document.createElement('a');
                imgLink.href = shoeLink;

                const img = document.createElement('img');
                img.classList.add('img-fluid');
                img.src = shoeImgSrc;
                img.alt = '';
                img.style.width = "100%";

                imgLink.appendChild(img);
                imgDiv.appendChild(imgLink);

                const captionDiv = document.createElement('div');
                captionDiv.classList.add('caption', 'ml-2');

                const rowDiv1 = document.createElement('div');
                rowDiv1.classList.add('row');

                const colDiv1 = document.createElement('div');
                colDiv1.classList.add('col');
                colDiv1.textContent = '7 Size';

                const colDiv2 = document.createElement('div');
                colDiv2.classList.add('col', 'mr-2');
                colDiv2.style.textAlign = 'right';

                const heartLink = document.createElement('a');
                heartLink.href = 'javascript:void(0);';

                const heartIcon = document.createElement('i');
                heartIcon.classList.add('fa-solid', 'fa-heart', 'heart');
                heartIcon.id = 'heart';

                heartLink.appendChild(heartIcon);
                colDiv2.appendChild(heartLink);

                rowDiv1.appendChild(colDiv1);
                rowDiv1.appendChild(colDiv2);

                captionDiv.appendChild(rowDiv1);

                const rowDiv2 = document.createElement('div');
                rowDiv2.classList.add('mr-2');

                const nameLink = document.createElement('a');
                nameLink.href = shoeLink;

                const nameBold = document.createElement('b');
                nameBold.textContent = shoeName;

                nameLink.appendChild(nameBold);
                rowDiv2.appendChild(nameLink);

                const priceP = document.createElement('p');
                priceP.textContent = shoePrice;

                rowDiv2.appendChild(priceP);
                captionDiv.appendChild(rowDiv2);

                imgDiv.appendChild(captionDiv);
                colDiv.appendChild(imgDiv);

                shoeContainer.appendChild(colDiv);
            }
        });

        if (!foundShoes) {
            shoeContainer.innerHTML = '<p class="mt-4 ml-4" id="message">Không tìm thấy sản phẩm phù hợp</p>';
        }
    }

    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const searchTerm = this.querySelector('input').value.trim();
        filterShoes(searchTerm);
    });

    searchForm.addEventListener('input', function () {
        const searchTerm = this.querySelector('input').value.trim();
        filterShoes(searchTerm);
    });


});