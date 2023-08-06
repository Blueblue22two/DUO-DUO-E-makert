"use strict"
// get category
var category = document.getElementById("category").value;

function showProducts() {
    var number = 12; // number of products want to show
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/get_products?category=" + category + "&number=" + number, true);
    console.log("category= "+ category);
    console.log("number= "+ number);
    xhr.responseType = "json";
    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        console.log("Request done");
        closeLoading();
        try {
          console.log("http status:" + xhr.status);
          if (xhr.status === 200) {
            // Clear thes product information
            var productsDiv = document.getElementById("products_div");
            productsDiv.innerHTML = "";
            // for each
            xhr.response.forEach(function (product) {
              // Create an HTML element for the item information
              var productElement = document.createElement("div");
              productElement.classList.add("product"); // add class .product
  
              // Create an HTML element for the anchor tag
              var anchorElement = document.createElement("a");
              anchorElement.href = "/Product?name=" + product.name;
  
              // Create an HTML element for the image information
              var imageElement = document.createElement("img");
              imageElement.src = "data:image/jpeg;base64," + product.image;
              imageElement.alt = product.name;
  
              // Create an HTML element for the name of the item information
              var nameElement = document.createElement("h3");
              nameElement.textContent = product.name;
  
              // Create an HTML element for the price of the item
              var priceElement = document.createElement("p");
              priceElement.classList.add("price");
              priceElement.textContent = "$" + product.price.toFixed(2);
  
              // Add the image element to the anchor tag
              anchorElement.appendChild(imageElement);
  
              // Add the product information to the product element
              productElement.appendChild(anchorElement);
              productElement.appendChild(nameElement);
              productElement.appendChild(priceElement);
  
              // Add the product element to the products div
              var productsDiv = document.getElementById("products_div");
              productsDiv.classList.add("products-container");
              productsDiv.appendChild(productElement);
            });
          } else {
            console.log("HTTP Error: " + xhr.status);
            return;
          }
        } catch (e) {
          console.log("Parsing response failed :" + e.message);
        }
      }
    };
    xhr.send();
}

// jump tp search page
document.getElementById("search_btn").addEventListener("click",function(event){
  event.preventDefault();
  window.location.href = '/Search';
})

// display loading animation
function Loading(){
  let loader = document.querySelector('.spinner');
  loader.style.display = "block";
  // Blur the background
  let container = document.getElementsByClassName("container");
  container[0].style.filter = "blur(5px)";
}

// Turn off loading animation
function closeLoading(){
  let loader = document.querySelector('.spinner');
  loader.style.display = "none";
  let container = document.getElementsByClassName("container");
  container[0].style.filter = "";
}

document.getElementById("more_btn").addEventListener("click",function(){
  // event.preventDefault();
  console.log("refershing...");
  Loading();
  setTimeout(showProducts, 300);
});

window.addEventListener("load", function() {
  console.log("loading the products");
  Loading();
  setTimeout(showProducts, 200);
});
