"use strict"

// check user is login or not
function checkLogin() {
    console.log('start check')
    var user = getCookie('username');
    if (user) {
        let type = getCookie('type');
        if(type==='customer'){
            customerLogin();
        }else if(type==='vendor'){
            vendorLogin();
        }else{
            Not_login();
            console.log("user type undifined!");
            return;
        }
    } else {
        console.log("Not logged in");
        Not_login();
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
    document.getElementById("Store_li").style.display = "none";
    document.getElementById("Cart_li").style.display = "none";
    document.getElementById("Record_li").style.display = "none";
}

function customerLogin(){
    document.getElementById("Cart_li").style.display = "inline-block";
    document.getElementById("Record_li").style.display = "inline-block";
}

function vendorLogin(){
    document.getElementById("Record_li").style.display = "inline-block";
    document.getElementById("Store_li").style.display = "inline-block";
}

window.addEventListener("load", function() {
    console.log("Loading the page");
    checkLogin();
});