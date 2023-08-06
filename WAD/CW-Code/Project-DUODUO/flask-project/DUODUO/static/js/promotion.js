"use strict"
// function: show all promotion products
function showProducts() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/get_promo_products", true);
    xhr.responseType = "json";
    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        console.log("Request done");
        try {
          console.log("http status:" + xhr.status);
          if (xhr.status === 200) {
            // Clear the product information
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

window.addEventListener("load", function() {
    console.log("loading the products");
    showProducts();
});
