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

document.addEventListener('DOMContentLoaded', function () {
    var hearts = document.querySelectorAll('.heart');

    hearts.forEach(function (heart) {
        heart.addEventListener('click', function () {
            heart.classList.toggle('active'); // Chuyển đổi giữa trạng thái có class 'active' và không có
        });
    });
});