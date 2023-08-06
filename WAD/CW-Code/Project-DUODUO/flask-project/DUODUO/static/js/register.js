"use strict"
var nameInput = document.querySelector('#username');
var passwordInput = document.querySelector('#password');
var confirmInput = document.querySelector('#confirm_password');
var phoneInput = document.querySelector('#phone_number');
var emailInput = document.querySelector('#email_address');
var addressInput = document.querySelector('#address');
var submitButton = document.querySelector('#register_btn');
var user_type  = document.querySelector('select[name="select_type"]');

// function of notification sound
function notification(){
    // 创建音频上下文  
    var audioCtx = new AudioContext();
    // 创建音调控制对象  
    var oscillator = audioCtx.createOscillator();
    // 创建音量控制对象  
    var gainNode = audioCtx.createGain();
    // 音调音量关联  
    oscillator.connect(gainNode);
    // 音量和设备关联  
    gainNode.connect(audioCtx.destination);
    // 音调类型指定为正弦波  
    oscillator.type = 'sine';
    // 设置音调频率  
    oscillator.frequency.value = 220.00;
    // 先把当前音量设为0  
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    // 0.01秒时间内音量从刚刚的0变成1，线性变化 
    gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.01);
    oscillator.start(audioCtx.currentTime);
    // 1秒时间内音量从刚刚的1变成0.001，指数变化 
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1);
    // 1秒后停止声音 
    oscillator.stop(audioCtx.currentTime + 1);
}

// register function
function Regis(){
    if(isValid()){
        let username = nameInput.value;
        let password = passwordInput.value;
        let address = addressInput.value;
        let email = emailInput.value;
        let phone = phoneInput.value;
        let type = user_type.value;

        console.log("ready to post a json data"); 
        var xhr = new XMLHttpRequest();
        xhr.open("POST",  "/register");
        xhr.setRequestHeader("Content-type", "application/json");

        // set time out function
        xhr.timeout = 4000; 
        xhr.ontimeout = function () {
            notification();
            window.alert("Request timeout, please check network connection!");
            console.log("Request timeout, please check network connection!");
            return;
        };
        var jsonData = JSON.stringify({
            "username": username,
            "password": password,
            "phone": phone,
            "email": email,
            "address": address,
            "type": type
        });
        console.log("Data: "+jsonData); // print out the data
        xhr.send(jsonData);

        // Receiving the response
        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) { // request has completed
                console.log("Request done");
                closeLoading();
                try {
                    var response = JSON.parse(xhr.responseText);
                    notification();
                    console.log("http status:"+xhr.status);
                    if (xhr.status === 200) { // register success and redirect to index page
                        var redirectUrl = response.redirectUrl;
                        console.log("Register success!!!"); 
                        setTimeout(function(){
                            window.location.href = redirectUrl;
                        }, 500);
                    } else if (xhr.status === 400) { // code: 400 bad request
                        console.log("Bad request: "+response.message); 
                        window.alert(response.message); 
                    } else {
                        window.alert(response.message); 
                        console.log('HTTP Error: ' + xhr.status); 
                    }
                } catch (e) {
                    console.log("Parsing response failed :" + e.message);
                }
            }
        };
    }else{
        closeLoading();
    }
}

// determine if the input is valid
function isValid(){
    var username = nameInput.value;
    var password =passwordInput.value;
    var confirm = confirmInput.value;
    var address = addressInput.value;
    var email = emailInput.value;
    var phone = phoneInput.value;
     // Verify that all elements cannot be null
     if  (nameInput.value.trim() === "" || 
     passwordInput.value.trim() === "" ||
     confirmInput.value.trim() === "" ||
     phoneInput.value.trim() === "" ||
     emailInput.value.trim() === "" ||
     addressInput.value.trim() === "") {
        notification();
        window.alert("Please fill in all items");
        return false;
    }
    if(username.length > 50) {
        notification();
        window.alert("The username must <= 50 characters");
        return false;
    }
    // Determines whether special characters are included
    if (/[^\s\w]/.test(username)) {
        notification();
        window.alert("The username cannot contain special characters.");
        return false;
    }
    if(password.length > 50) {
        notification();
        window.alert("The password <=50 characters");
        return false;
    }
    if (/[\W_]/.test(password)) {
        notification();
        window.alert("The password cannot contain special characters.");
        return false;
    }
    if(password !== confirm) {
        notification();
        window.alert("The password and confirm password must match");
        return false;
    }
    if(phone.length > 20) {
        notification();
        window.alert("The phone number must be <= 20 characters");
        return false;
    }
    // Determines whether special characters are included
    if (/[\W_]/.test(phone)) {
        notification();
        window.alert("The phone number cannot contain special characters.");
        return false;
    } 
    if(email.length > 50) {
        notification();
        window.alert("The email must be <= 50 characters");
        return false;
    }
    if(address.length > 255) {
        notification();
        window.alert("The address must <= 255 characters");
        return false;
    }    
    console.log("Data validation has passed"); 
    return true;
}

function Loading(){
    // display loading animation
    let loader = document.querySelector('.spinner');
    loader.style.display = "block";
    // Blur the background
    let container = document.getElementsByClassName("container");
    container[0].style.filter = "blur(5px)";
}

function closeLoading(){
    // Turn off loading animation
    let loader = document.querySelector('.spinner');
    loader.style.display = "none";
    let container = document.getElementsByClassName("container");
    container[0].style.filter = "";

}

// add a event, after user click the submit 
submitButton.addEventListener('click',function(event){
    console.log("The register button is triggered"); 
    event.preventDefault();
    Loading();
    setTimeout(Regis, 500);
})