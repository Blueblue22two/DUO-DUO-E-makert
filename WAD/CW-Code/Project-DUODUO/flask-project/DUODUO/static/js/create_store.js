var submitButton = document.querySelector('#sumbit_btn');

function createStore(){
    let username = getCookie('username');
    if (username === null){
        console.log("Cookie not exist!");
        closeLoading();
        return;
    }
    let name = document.getElementById("name").value;
    if  (name== "") {
        notification();
        closeLoading();
        window.alert("Please fill in all items");
        return false;
    }
    // get image of store logo
    var fileInput = document.getElementById('storeImage');
    // verify image
    if (!fileInput.value) {
        closeLoading();
        notification();
        window.alert('Please upload image!');
        return;
    }
    fileInput.setAttribute("accept", "image/jpeg, image/png"); // limit the image file type
    var file = fileInput.files[0];
    // verify data is valid or not
    if(name.length > 50) {
        closeLoading();
        notification();
        window.alert("The name must &lt = 50 characters");
        return false;
    }
    // Determines whether special characters are included
    if (/[^\s\w]/.test(name)) {
        closeLoading();
        notification();
        window.alert("Cannot contain special characters other than Spaces");
        return false;
    }
    // Check the size of the image
    if (file.size > 1024 * 1024) {
        closeLoading();
        notification();
        console.log("Image file should have less than 1MB of memory.");
        window.alert("Image file should have less than 1MB of memory.");
        return;
    }
    console.log("Data validation has passed");

    var xhr = new XMLHttpRequest();
    xhr.open("POST",  '/regisMyStore', true);
    // set time out function
    xhr.timeout = 4000; 
    xhr.ontimeout = function () {
        notification();
        window.alert("Request timeout, please check network connection!");
        console.log("Request timeout, please check network connection!");
        return;
    };
    var formData = new FormData();
    formData.append('storeImage', file);
    formData.append('name', name);
    formData.append('username', username);
    console.log('storeImage: ', file);
    console.log('name: '+name);
    console.log('username: ', username)
    // call back function
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            console.log("Request done");
            closeLoading();
            try {
                var response = JSON.parse(xhr.responseText);
                notification();
                console.log("http status:"+xhr.status);
                if (xhr.status === 200) { // register success and redirect
                    var redirectUrl = response.redirectUrl;
                    console.log("will jump to :"+redirectUrl); 
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
    // send request
    xhr.send(formData);
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
    event.preventDefault();
    Loading();
    setTimeout(createStore, 400);
})

window.onload = function() {
    console.log("Loading the page");
    window.alert("You don't have your own store yet, please create one");
};