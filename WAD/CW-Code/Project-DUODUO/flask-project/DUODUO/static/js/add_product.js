// var submitButton = document.querySelector('#sumbit_btn');
var submitButton = document.getElementById('sumbit_btn');

function createStore(){
    let username = getCookie('username');
    if (username === null){
        closeLoading();
        console.log("Cookie not exist!");
        return;
    }
    let name = document.getElementById("name").value;
    let price = document.getElementById("price").value;
    let descrip = document.getElementById("description").value;
    let type  = document.querySelector('select[name="select_type"]').value;
    if  (name== "" || descrip=="" || price=="") {
        closeLoading();
        notification();
        window.alert("Please fill in all items");
        return false;
    }
    // get image of store logo
    var fileInput1 = document.getElementById('Image1');
    var fileInput2 = document.getElementById('Image2');
    // verify image
    if (!fileInput1.value || !fileInput2.value) {
        closeLoading();
        notification();
        window.alert('Please upload two images!');
        return;
    }
    // check number of images
    if (fileInput1.files.length !== 1 || fileInput2.files.length !== 1) {
        closeLoading();
        notification();
        window.alert('Please upload two images!');
        return;
    }
    // limit the image file type
    fileInput1.setAttribute("accept", "image/jpeg, image/png"); 
    fileInput2.setAttribute("accept", "image/jpeg, image/png");
    var file1 = fileInput1.files[0];
    var file2 = fileInput2.files[0];

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
        window.alert("Cannot contain special characters other than Spaces in name");
        return false;
    }
    if(descrip.length > 500) {
        closeLoading();
        notification();
        window.alert("The length of description must &lt = 500 characters");
        return false;
    }
    // Check the size of the image
    if (file1.size > 1220 * 1220) {
        closeLoading();
        notification();
        console.log("Image file should have less than 1MB of memory.");
        window.alert("Image file should have less than 1MB of memory.");
        return;
    }
    if (file2.size > 1220 * 1220) {
        closeLoading();
        notification();
        console.log("Image file should have less than 1MB of memory.");
        window.alert("Image file should have less than 1MB of memory.");
        return;
    }
    console.log("Data validation has passed");

    var xhr = new XMLHttpRequest();
    xhr.open("POST",  '/AddProduct', true);

    // set time out function
    xhr.timeout = 4000; 
    xhr.ontimeout = function () {
        notification();
        window.alert("Request timeout, please check network connection!");
        console.log("Request timeout, please check network connection!");
        return;
    };

    var formData = new FormData();
    formData.append('Image1', file1);
    formData.append('Image2', file2);
    formData.append('username', username);
    formData.append('productname', name);
    formData.append('price', price);
    formData.append('type', type);
    formData.append('description', descrip);
    console.log('Image1: ', file1);
    console.log('Image2: ', file2);
    console.log('name: '+name);
    console.log('username: ', username);
    console.log('price: ',price);
    console.log('description', descrip);

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
                    window.alert("Added product successfully")
                    setTimeout(function(){
                        window.location.href = redirectUrl;
                    }, 600);
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