"use strict"
var Pid =document.getElementById('Pid').value;
const commentTextArea = document.getElementById('comment');
const postButton = document.getElementsByClassName('post-button')[0];

// function: get all comments and display it;
function displayAll(){
    var Pid =document.getElementById('Pid').value;
    console.log("Product id: ",Pid);
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "/getComment?Pid="+Pid, true);
    xhr.responseType = "json";
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            console.log("Request done");
            try {
                console.log("http status:" + xhr.status);

                if (xhr.status === 200) {
                    const commentsDiv = document.querySelector(".comments");
                    commentsDiv.innerHTML = ""; // Clear the original comments
                    const response = xhr.response;
                    console.log(response)
                    if (response && Array.isArray(response.comments)) { // Ensure response and comments are defined
                        const comments = response.comments; 
                        // get each comment and add it to commentsDiv
                        comments.forEach(comment => { 
                            const commentDiv = document.createElement("div");
                            commentDiv.classList.add("comment");
                            const authorSpan = document.createElement("span");
                            authorSpan.classList.add("author");
                            authorSpan.textContent = comment.author + ": ";
                            const contentSpan = document.createElement("span");
                            contentSpan.textContent = comment.content + "   "; // add a space
                            const dateSpan = document.createElement("span"); // add the date span
                            dateSpan.classList.add("date");
                            dateSpan.textContent = "(" + comment.date + ")";

                            contentSpan.textContent = comment.content;
                            commentDiv.appendChild(authorSpan);
                            commentDiv.appendChild(contentSpan);
                            commentDiv.appendChild(dateSpan);
                            commentsDiv.appendChild(commentDiv);
                        });
                        console.log("display done")
                    } else {
                        console.log("Don't have comment in this product")
                    }

                } else { // display error message
                    console.log("HTTP Error: " + xhr.status);
                    if (xhr.response && xhr.response.message) {
                        console.log("HTTP Error Message: " + xhr.response.message);
                    }
                }
            } catch (e) {
                console.log("Parsing response failed :" + e.message);
            }
        }
    };
    xhr.send();
}


// TODO: post a comment function
function post(){
    var user = getCookie('username'); // customer name
    var commentValue = commentTextArea.value;

    // get current date
    var currentDate = new Date();
    var year = currentDate.getFullYear();
    var month = currentDate.getMonth() + 1;
    var day = currentDate.getDate();
    var dateString = year + "-" + month + "-" + day;
    console.log("date: ",dateString)
    console.log("Pid:",Pid)
    // send data to flask
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/getComment", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            console.log("Request done");
            try {
                console.log("http status:" + xhr.status);
                if (xhr.status === 200) {
                    console.log('Comment successfully posted');
                    window.alert('Comment successfully posted');
                    // redierct to refersh the page and set the Pid
                    window.location.href = "/Comment?Pid="+Pid;
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
    xhr.send(JSON.stringify({
        'customername': user,
        'commentValue': commentValue,
        'product_id': Pid,
        'tims': dateString
    }));
}


// check user is login or not
function checkLogin() {
    console.log('start check')
    var user = getCookie('username');
    if (user) {
        console.log("welcome! ",user);
        let type = getCookie('type');
        if(type==='customer'){
            console.log("customer log in")
        }else if(type==='vendor'){
            console.log("vendor log in");
            window.alert("Only customer can post comment");
            disablePost();
        }else{
            console.log("user type undifined!");
            window.alert("You can post comments after logging in");
            disablePost();
        }
    } else {
        console.log("Not logged in");
        window.alert("You can post comments after logging in");
        disablePost();
    }
}

// function: disable the Post button(not log in)
function disablePost(){
    document.querySelector(".post-button").disabled = true;
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

// add a event to the post button
postButton.addEventListener("click",function(){
    console.log("click on post button...");
    // verify the input text can not be null
    var commentValue = commentTextArea.value.trim();
    if(commentValue === ''){
        console.log("Comments cannot be empty");
        window.alert("Comments cannot be empty");
    }else{
        post();
    }
});

window.addEventListener("load", function() {
    console.log("Loading the page");
    checkLogin();
    displayAll();
});
