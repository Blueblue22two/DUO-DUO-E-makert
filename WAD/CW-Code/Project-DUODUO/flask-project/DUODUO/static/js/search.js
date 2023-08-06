"use strict"
// get select type
var selectType  = document.querySelector('select[name="select_type"]');
// get input
var searchInput = document.getElementById("search");
var searchBtn = document.querySelector("#search_btn");

function search(){
    var type = selectType.value;
    var input = searchInput.value;
    // Validate input validity
    if  (input == "") {
       notification();
       window.alert("Please fill in all items");
       closeLoading();
       return;
    }
   if(input.length > 50) {
       notification();
       window.alert("The username must &lt = 50 characters");
       closeLoading();
       return;
    }
    console.log("keyword:" + input);
    console.log("type:" + type);

    // send request
    var xhr = new XMLHttpRequest();
    xhr.open("POST",  "/Search",true);
    xhr.setRequestHeader("Content-type", "application/json");
    var jsonData = JSON.stringify({
        "keyword": input,
        "type": type
    });

    // Receiving the response
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
                var response = JSON.parse(xhr.response);
                if(type =="products"){
                    // for each
                    response.forEach(function (product) {
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

                        // Add the product information to the page
                        productElement.appendChild(anchorElement);
                        productElement.appendChild(nameElement);
                        productElement.appendChild(priceElement);
            
                        var productsDiv = document.getElementById("products_div");
                        productsDiv.classList.add("products-container");
                        productsDiv.appendChild(productElement);
                    });
                    console.log("search done");

                }else{ // type = stores
                    response.forEach(function (product) {
                        // Create an HTML element for the item information
                        var productElement = document.createElement("div");
                        productElement.classList.add("product"); // add class .product
                        
                        // Create an HTML element for the anchor tag
                        var anchorElement = document.createElement("a");
                        anchorElement.href = "/Store?id=" + product.id;
                        console.log("Store id: ", product.id)

                        // Create an HTML element for the image information
                        var imageElement = document.createElement("img");
                        imageElement.src = "data:image/jpeg;base64," + product.image;
                        imageElement.alt = product.name;
                    
                        // Create an HTML element for the name of the item information
                        var nameElement = document.createElement("h3");
                        nameElement.textContent = product.name;
                        
                        // Add the image element to the anchor tag
                        anchorElement.appendChild(imageElement);

                        // Add the product information to the page
                        productElement.appendChild(anchorElement);
                        productElement.appendChild(nameElement);
            
                        var productsDiv = document.getElementById("products_div");
                        productsDiv.classList.add("products-container");
                        productsDiv.appendChild(productElement);
                    });
                    console.log("search done");
                }
              } else {
                console.log("HTTP Error: " + xhr.status);
                return;
              }
            } catch (e) {
              console.log("Parsing response failed :" + e.message);
            }
          }
    };
    xhr.send(jsonData);
}

// function of notification sound
function notification(){ 
    var audioCtx = new AudioContext(); 
    var oscillator = audioCtx.createOscillator(); 
    var gainNode = audioCtx.createGain();
    oscillator.connect(gainNode); 
    gainNode.connect(audioCtx.destination); 
    oscillator.type = 'sine';
    oscillator.frequency.value = 220.00; 
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime); 
    gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.01);
    oscillator.start(audioCtx.currentTime); 
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1);
    oscillator.stop(audioCtx.currentTime + 1);
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

// search button
searchBtn.addEventListener("click", function(event) {
    event.preventDefault();
    Loading();
    console.log("start searching");
    setTimeout(search, 300);
});
