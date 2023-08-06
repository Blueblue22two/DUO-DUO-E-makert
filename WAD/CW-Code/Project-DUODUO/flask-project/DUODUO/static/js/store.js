"use strict"

var id = document.getElementById("store_id").value;

// function: to get all products in this store
function getAll(){
    // TODO: get store id and send request to flask
    console.log("store id: ",id);
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "/allProduct?id="+id, true);
    xhr.responseType = "json";

    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          console.log("Request done");
          closeLoading();
          try {
            console.log("http status:" + xhr.status);
            if (xhr.status === 200) {
                // set the store name and store logo
                var logoDiv = document.getElementsByClassName("logo_div")[0];
                logoDiv.innerHTML = "<img src='data:image/jpeg;base64," + xhr.response.logo + "' alt='logo'/>"

                var storeName = document.getElementsByClassName("header")[0];
                storeName.textContent = xhr.response.store_name;

                // Clear the product information
                var productsDiv = document.getElementById("products_div");
                productsDiv.innerHTML = "";

                // for each
                xhr.response.products.forEach(function (product) {
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
                console.log("display successful")
            } else {
                var message = xhr.response.message;
                console.log("Error: " + message);
                return;
            }
          } catch (e) {
            console.log("Parsing response failed :" + e.message);
          }
        }
      };
    xhr.send();
}

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
  
// event: jump tp search page
document.getElementById("search_btn").addEventListener("click",function(event){
    event.preventDefault();
    window.location.href = '/Search';
})

// event: loading
window.addEventListener("load", function() {
    console.log("Loading the page");
    Loading();
    setTimeout(getAll,300);
});