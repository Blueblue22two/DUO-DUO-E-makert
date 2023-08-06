"use strict"
var nameInput = document.querySelector('#username');
var passwordInput = document.querySelector('#password');

// log in function
function login(){
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    // Verify that all elements cannot be null
    if  (nameInput.value.trim() === "" || 
    passwordInput.value.trim() === "") {
       notification();
       closeLoading();
       window.alert("Please fill in all items");
       return false;
   }
    // verify data is valid or not
    if(username.length > 50) {
        notification();
        window.alert("The username must <= 50 characters");
        closeLoading();
    }
    // Determines whether special characters are included
    if (/[\W_]/.test(username)) {
        notification();
        window.alert("The username cannot contain special characters.");
        closeLoading();
    }
    if(password.length > 50) {
        notification();
        window.alert("The password <=50 characters");
        closeLoading();
    }
    if (/[\W_]/.test(password)) {
        notification();
        window.alert("The password cannot contain special characters.");
        closeLoading();
    }
    console.log("Data validation has passed");

    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    // Converts from data to a string
    let data = "username=" + encodeURIComponent(username) +"&password=" + encodeURIComponent(password);
    // call back function
    xhr.onreadystatechange = function() {
        try{
            if (xhr.readyState === 4) {
                closeLoading();
                var response = JSON.parse(xhr.responseText);
                console.log("http status:"+xhr.status);
                if (xhr.status === 200) {
                    var user = getCookie('username');
                    var type = getCookie('type');
                    // 接受用户类型
                    if(type==='customer'){ // type
                        console.log('welcome!'+user+" : "+type);
                        notification();
                        customerLogin();
                        window.alert('welcome!'+user);
                        return;
                    }else if(type==='vendor'){
                        console.log('welcome!'+user+" : "+type);
                        notification();
                        vendorLogin();
                        window.alert('welcome!'+user);
                        return;
                    }else{
                        console.log("user type undifined!");
                        window.alert("user type undifined!");
                        Not_login();
                        return;
                    }
                } else {
                    closeLoading();
                    notification();
                    console.log("Bad request: "+response.message); 
                    window.alert(response.message); 
                    return;
                }
            }
        }catch(e){
            closeLoading();
            console.log("Parsing response failed :" + e.message);
        }
    };
    xhr.send(data);
}

// check user is login or not
function checkLogin() {
    console.log('start check')
    var user = getCookie('username');
    if (user) {
        console.log("welcome! ",user);
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

// log out function
function logOut(){
    Not_login();
    // delete all cookies
    delCookie('type');
    delCookie('username');
    delCookie('password');
    notification();
    console.log("log out success");
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

// delete cookie
function delCookie(name){
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval = getCookie(name);
    if (cval != null) document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
}

// hide a part of function which only allowed user are logged in
function Not_login(){
    document.getElementById("Store_li").style.display = "none";
    document.getElementById("Cart_li").style.display = "none";
    document.getElementById("Record_li").style.display = "none";
    document.getElementById("top_right").style.display ="none";
    showLogin();
}

function customerLogin(){
    document.getElementById("Cart_li").style.display = "inline-block";
    document.getElementById("Record_li").style.display = "inline-block";
    document.getElementById("top_right").style.display ="block";
    document.getElementById("login_box").style.display = "none";
    document.getElementById("mini_login_box").style.display = "none";
}

function vendorLogin(){
    document.getElementById("Store_li").style.display = "inline-block";
    document.getElementById("Record_li").style.display = "inline-block";
    document.getElementById("top_right").style.display ="block";
    document.getElementById("login_box").style.display = "none";
    document.getElementById("mini_login_box").style.display = "none";
}

// show the login box with fade-in effect,and display login box
function showLogin() {
    let loginBox = $("#login_box");
    loginBox.fadeIn("slow");
    let miniLogin = $("#mini_login_box");
    miniLogin.fadeOut();
}

// close the login box with fade out effect,and display mini login box
function closeLogin() {
    let loginBox = $("#login_box");
    loginBox.fadeOut("slow");
    let miniLogin = $("#mini_login_box");
    miniLogin.fadeIn();
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

// Verify that the merchant has already created a store
function checkStore(){
    var name = getCookie('username');
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/checkStore", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) { // request has completed
            console.log("Request done");
            closeLoading();
            try {
                var response = JSON.parse(xhr.responseText);
                var redirectUrl = response.redirectUrl;
                console.log("http status:"+xhr.status);
                if (xhr.status === 200) { // to Store page
                    console.log("Already have a store");
                    setTimeout(function(){
                        window.location.href = redirectUrl;
                    }, 200);
                } else if(xhr.status === 302){ // register store
                    console.log("No existing store was found"); 
                    setTimeout(function(){
                        window.location.href = redirectUrl;
                    }, 200);
                }else{
                    console.log("Cookie wrong"); 
                    return;
                }
            } catch (e) {
                console.log("Parsing response failed :" + e.message);
            }
        }
    }
    var jsonData = JSON.stringify({
        "username": name,
    });
    console.log("username:"+name);
    xhr.send(jsonData);
}

// event: jump tp search page
document.getElementById("search_btn").addEventListener("click",function(event){
    event.preventDefault();
    window.location.href = '/Search';
})

// event: submit button of log in
document.getElementById("submit_btn").addEventListener("click", function(event) {
    event.preventDefault();
    Loading();
    setTimeout(login, 300);
});

//log out
document.getElementById("log_out_btn").addEventListener("click", function() {
    notification;
    if (confirm("Are you sure you want to log out?")) {
        logOut();
    }
});
  
// jump to store button
document.getElementById("Store_btn").addEventListener("click", function() {
    console.log("check start...");
    Loading();
    setTimeout(checkStore, 300);
});

// 当页面加载时,检查登录状态
window.onload = function() {
    console.log("Loading the page");
    checkLogin();
};