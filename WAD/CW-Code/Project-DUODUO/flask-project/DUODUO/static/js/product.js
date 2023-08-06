"use strict"
var productActions = document.querySelector('.product-actions');
var likeBtn = document.querySelector('.like_btn');
var dislikeBtn = document.querySelector('.dislike_btn');
var cartBtn = document.querySelector('.add-to-cart-btn');
var buyBtn = document.querySelector('.buy-btn');
var commentBtn = document.querySelector('.comment-btn');
// get value of discount,price and Product id
var discountVal = document.getElementById("dis").value;  // 获取discount折扣价的值
var price = document.getElementById("pri").value;
var Pid =document.getElementById('Pid').value;
// image
var img1 = document.getElementById("img1");
var img2 = document.getElementById("img2");

var command = checkLogin();
console.log("command: ",command);

// 检测discount的值是否=0,若等于则不管
// 若不等于，则显示<p class="product-discounted-price">
// 并且将<p class="product-price">加上一个横线的效果text-decoration:line-through
function changePrice(){
    var pri = document.querySelector('.product-price');
    var dis = document.querySelector('.product-discounted-price');
    pri.style.textDecoration = "line-through";
    dis.style.display="block";
}

function addLike(){
    console.log("add a Like");
    let xhr = new XMLHttpRequest();
    var num = 1;
    xhr.open("GET", "/setLike?num="+num + "&Pid=" +Pid, true);
    xhr.responseType = "json";
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          console.log("Request done");
          try {
            console.log("http status:" + xhr.status);
            if (xhr.status === 200) {
                let likeCount = document.getElementById("like_count");
                let newCount = Number(likeCount.value) + 1; // Convert values to numbers
                likeCount.value = newCount;
                Disable();
                console.log("Update like successful");
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

function addDislike(){
    console.log("add a disLike");
    let xhr = new XMLHttpRequest();
    var num = 0;
    xhr.open("GET", "/setLike?num="+num +"&Pid=" +Pid, true);
    xhr.responseType = "json";
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          console.log("Request done");
          try {
            console.log("http status:" + xhr.status);
            if (xhr.status === 200) {
                // update the number of likes
                let dislikeCount = document.getElementById("dislike_count");
                let newCount = Number(dislikeCount.value) + 1; // Convert values to numbers
                dislikeCount.value = newCount;
                Disable();
                console.log("Update  dislike successful");
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

// after user click like or dislike button
// disbale user to click again
function Disable(){
    console.log("The button has been disabled");
    likeBtn.disabled = true;
    dislikeBtn.disabled = true;
}

// Click the button to switch the function of the picture
function changeIMG(){
    console.log("change Image");
    if(img1.style.display === 'none'){
        console.log("display Img1");
        img1.style.display = 'block';
        img2.style.display = 'none';
    }else{
        console.log("display Img2");
        img2.style.display = 'block';
        img1.style.display = 'none';
    }
}

// function of add item to cart
function addCart(number){
    var user = getCookie('username');
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "/addCart?name="+user+"&Pid="+Pid+"&number="+number, true);
    xhr.responseType = "json";
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          console.log("Request done");
          try {
            console.log("http status:" + xhr.status);
            if (xhr.status === 200) {
                console.log("Product added successfully");
                window.alert("Product added successfully");
            } else {
              console.log("HTTP Error: " + xhr.status);
              if (xhr.response && xhr.response.message) { // display error message
                console.log("HTTP Error Message: " + xhr.response.message);
              }
              return;
            }
          } catch (e) {
            console.log("Parsing response failed :" + e.message);
          }
        }
    };
    xhr.send();
}

// function of jump to Payment page
// number是商品的数量
function Buy(number){
    let price1;
    if(discountVal!=0){
        // 有折扣价
        price1 = discountVal;
    }else{
        price1 = price;
        // 没有折扣价
    }
    let total = price1*number;
    console.log("price:",price1," | quantity:",number);
    console.log("total_price:",total);
    // 跳转到支付界面，并且将商品id，价格，数量参数传递过去
    window.location.href = "/payment?Pid="+Pid+"&price="+price1+"&number="+number;
}

// check user is login or not
function checkLogin() {
    console.log('start check')
    var user = getCookie('username');
    if (user) {
        console.log("welcome! ",user);
        let type = getCookie('type');
        if(type==='customer'){
            return 1;
        }else if(type==='vendor'){
            vendorLogin();
            return 2;
        }else{
            console.log("user type undifined!");
            Not_login();
            return 3;
        }
    } else {
        console.log("Not logged in");
        Not_login();
        return 3;
    }
}

// get Cookie
function getCookie(name) {
    var cookies = document.cookie.split(';'); // Split them into an array
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        if (cookie.indexOf(name) === 0) {
        return cookie.substring(name.length + 1, cookie.length);
        }
    }
    return null;
}

function Not_login(){
    productActions.style.display ="none";
}

function vendorLogin(){
    productActions.style.display ="none";
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

likeBtn.addEventListener("click",function(){
    if(command==1){
        addLike();
    }else if(command==2){
        notification();
        window.alert("Vendor cannot use this feature!");
    }else{
        notification();
        window.alert("Please log in your account first!");
    }
});

dislikeBtn.addEventListener("click",function(){
    if(command==1){
        addDislike();
    }else if(command==2){
        notification();
        window.alert("Vendor cannot use this feature!");
    }else{
        notification();
        window.alert("Please log in your account first!");  
    }
});

// event: add product to cart
cartBtn.addEventListener("click",function(){
    var number = document.getElementById('quantity-input').value; // number of products
    console.log("number: ",number);
    if(number<=1){
        console.log("The minimum quantity of products is 1");
        addCart(1);
    }else if(number>=99){
        console.log("The maximum number of items is 99");
        addCart(99);
    }else{
        addCart(number);
    }
});

// event: click buy button
buyBtn.addEventListener("click",function(){
    var number = document.getElementById('quantity-input').value; // number of products
    console.log("number: ",number);
    if(number<=1){
        console.log("The minimum quantity of products is 1");
        Buy(1);
    }else if(number>=99){
        console.log("The maximum number of items is 99");
        Buy(99);
    }else{
        Buy(number);
    }
});

// event: go to comment page
commentBtn.addEventListener("click",function(){
    console.log("click on comment button...");
    window.location.href = "/Comment?Pid="+Pid; // 手动跳转到Comment.html页面
});


window.addEventListener("load", function() {
    console.log("Loading the page");
    console.log("discount value: ",discountVal);
    if(discountVal!=0){
        changePrice();
    }
});


