// function: get data of store and display data
function displayData(){
    let username = getCookie('username');
    if (username === null){
        console.log("Cookie not exist!");
        return;
    }
    var xhr = new XMLHttpRequest();
    xhr.open("POST",  "/getStoreData", true);
    xhr.setRequestHeader("Content-type", "application/json");
    var jsonData = JSON.stringify({
        "username": username,
    });
    console.log("username:"+username);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            console.log("Request done");
            try {
                var response = JSON.parse(xhr.responseText);
                console.log("http status:"+xhr.status);
                if (xhr.status === 200) {
                    // get data
                    let store_name = response.data.name;
                    let volume = response.data.volume;
                    let sales = response.data.sales;
                    let num =response.data.num;
                    console.log("total_volume: "+volume);
                    console.log("total_sales: "+sales);
                    console.log("number of goods: "+num);
                    console.log("store name: "+store_name);
                    // Set data
                    const header = document.querySelector('.header');
                    header.textContent = store_name;
                    document.getElementById("total_volume").value = volume;
                    document.getElementById("total_sales").value = sales;
                    document.getElementById("num_goods").value = num;
                    return;
                } else if (xhr.status === 400) { // code: 400 bad request
                    console.log("Bad request: "+response.message); 
                    return;
                } else {
                    console.log('HTTP Error: ' + xhr.status); 
                    return;
                }
            } catch (e) {
                console.log("Parsing response failed :" + e.message);
            }
        }
    };
    xhr.send(jsonData);
}

// function: get Cookie
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

window.onload= displayData;