// function: display records
function getRecords(user,type){
    // request all records of this account(send the name and type to flask)
    let xhr = new XMLHttpRequest();
    let data = { 
        "name": user,
        "type":type
    };
    xhr.open("POST", "/Records", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          console.log("Request done");
          try {
            console.log("http status:" + xhr.status);
            if (xhr.status === 200) {
                // TODO: receive the data from flask
                // TODO: display all record
            }else if(xhr.status === 202){
                // error
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
    xhr.send(JSON.stringify(data)); 
}

// TODO: Get the order record for the specified date
// function getSpecified(){
//     var user = getCookie('username');
//     var date = document.getElementById("order-date").value;
// }

// check user is login or not，if not, jump page to home apge
function checkLogin() {
    console.log('start check')
    var user = getCookie('username');
    if (user) {
        let type = getCookie('type');
        console.log("type: ",type);
        if(type==='customer'){
            getRecords(user,type);
        }else if(type==='vendor'){
            getRecords(user,type);
        }else{
            console.log("user type undifined!");
            window.location.href="/";
        }
    } else {
        console.log("Not logged in");
        window.location.href="/";
    }
}

// fcuntion: get Cookie
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

// event
window.addEventListener("load", function() {
    checkLogin();
});