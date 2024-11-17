const ctx = document.getElementById('barChart');

new Chart(ctx, {
  type: "bar",
  data: {
    labels: [
      "Giày thể thao",
      "Boot nam",
      "Dép nam",
      "Giày tây",
      "Giày cao gót",
      "Giày búp bê",
      "Dép nữ",
      "Boot nữ"
    ],
    datasets: [{
      backgroundColor: [
        "red", "green", "blue", "orange", "brown",
        "purple", "yellow", "pink"
      ],
      data: shoeArrNumbers
    }]
  },
  options: {
    responsive: true,  
    plugins: {
      legend: {
        display: false 
      }
    },
    scales: {
      y: {
        beginAtZero: true 
      }
    }
  }
});


var xValues = ["COD",
  "ATM",
  "ZaloPayQR",
  "Visa",
  "PayPal",
  "VietQR"];
var yValues = paymentArrNumbers;
var barColors = [
  "#b91d47",
  "#00aba9",
  "#2b5797",
  "#e8c3b9",
  "#1e7145",
  "#ff5733"
];

new Chart("pieChart", {
  type: "pie",
  data: {
    labels: xValues,
    datasets: [{
      backgroundColor: barColors,
      data: yValues
    }]
  },
  options: {
    responsive: true,  
    title: {
      display: true,
      text: ""
    }
  }
});

const cty = document.getElementById('barChartPayment');

new Chart(cty, {
  type: 'bar',
  data: {
    labels: monthsArr,
    datasets: [{
      label: 'VND',
      data: totalArrNumbers, 
      borderWidth: 1
    }]
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value.toLocaleString(); // Sử dụng toLocaleString để hiển thị số với dấu phẩy
          }
        }
      }
    }
  }
});
