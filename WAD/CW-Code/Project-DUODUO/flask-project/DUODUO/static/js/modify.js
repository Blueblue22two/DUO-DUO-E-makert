// get table
const table = document.getElementById("productTable");
const tbody = table.getElementsByTagName("tbody")[0];

// function: display all of product information in this store
function displayProduct(){
    var name = getCookie('username');
    console.log("vendor name: ",name)
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "/storeSpecificData?name="+name, true);
    xhr.responseType = "json";
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          console.log("Request done");
          try {
            console.log("http status:" + xhr.status);
            if (xhr.status === 200) {
                let tableBody = document.querySelector("#productTable tbody")

                // 创建用于展示每个商品信息的html元素并添加到table-body中
                for(let i = 0; i < xhr.response.products.length; i++) {
                    let product = xhr.response.products[i]
                    let newRow = document.createElement('tr')
                    // 下面新增了一个class=boolean的一列，该列展示该商品是否有促销活动，将其值赋值为返回的new_price中的值
                    newRow.innerHTML = `
                        <td><input type="number" class="Pid" name="productID" readonly="true" value="${product.product_id}"/></td>
                        <td><input type="text" name="productName" value="${product.name}"/></td>
                        <td><input type="number" name="productPrice" min="0.1" step="0.1"  value="${product.price}"/></td>
                        <td><input type="text" class="Promo" name="boolean" value="${product.new_price}" readonly="true"/></td>
                        <td><button class="removeBtn">Remove</button></td>
                        <td><button class="updateBtn">Update</button></td>
                        <td><button class="addPromotionBtn">Add Promotion</button></td>
                    `
                    tableBody.appendChild(newRow)
                }
                //  set store id
                let storeId = document.querySelector("#Sid")
                storeId.setAttribute("value",xhr.response.products[0].store_id)

                // display store name
                let storeName = document.querySelector(".storeName")
                storeName.textContent = xhr.response.products[0].store_name 

                console.log("store id: ",xhr.response.products[0].store_id);
                console.log("store name: ",xhr.response.products[0].store_name );
                console.log("display success")
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

// function: add a Promotion
function addPromotion(productID, promotionPrice, startDate, endDate){
    console.log("productID",productID);
    console.log("price",promotionPrice);
    console.log("startDate",startDate);
    console.log("endDates",endDate);
    // verify data
    if (promotionPrice <= 0 || promotionPrice >= 100000 || !/^\d+(.\d{1})?$/.test(promotionPrice)){
      notification();
      window.alert("Price must be a numeric value with at most 1 decimal place, and at least 0.1");
      return;
    }
    
    var today = new Date().toISOString().substr(0, 10);
    if (endDate <= today) {
      notification();
      window.alert("The end date must be later than today.");
      return;
    }
    // get store id
    var Sid = document.getElementById('Sid').value;
    console.log("Store id:",Sid);
    let xhr = new XMLHttpRequest();

    // send json data(Store id, productID, promotionPrice, startDate, endDate) to Flask
    xhr.open("POST", "/AddPromotion", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log('Response:', xhr.responseText);
            notification();
            window.alert(xhr.responseText);
        }else{
            console.log('Error-Response:', xhr.responseText);
        }
    };
    // json date
    const data = JSON.stringify({
        "Sid": Sid,
        "productID": productID,
        "price": promotionPrice,
        "start_date": startDate,
        "end_date": endDate
    });
    xhr.send(data);
}

// function: update information of product
function update(productID, productName, price) {
  console.log("productID: ", productID, " | productName: ", productName, " | price: ", price);
  // verify date
  if (productName.trim() === '') {
    notification();
    window.alert("Product name can't be empty");
    return false;
  }

  if(productName.length > 50) {
    notification();
    window.alert("The product name must &lt = 50 characters");
    return false;
  }
  // Determines whether special characters are included
  if (/[^\s\w]/.test(productName)) {
      notification();
      window.alert("The name cannot contain special characters.");
      return false;
  }

  if(price < 0.1 || price > 100000000) {
    notification();
    window.alert("The price must be between 0.1 and 100 million");
    return false;
  }
  // Contains at most one decimal
  const decimalPart = price.toString().split('.')[1];
  if(decimalPart && decimalPart.length > 1) {
    notification();
    window.alert("The price must be at most 1 decimal place");
    return false;
  }

  let xhr = new XMLHttpRequest();
  xhr.open("GET", `/UpdateProduct?Pid=${productID}&name=${productName}&price=${price}`, true);
  // set the response type to JSON
  xhr.responseType = "json";
  
  // handle the onload event
  xhr.onload = function() {
    if (xhr.status === 200) {
      console.log(xhr.response.message);
      notification();
      window.alert(xhr.response.message);
      // TODO: handle the response from the server
    } else {
      console.error(xhr.statusText);
    }
  };
  // error
  xhr.onerror = function() {
    console.error(xhr.statusText);
  };
  
  xhr.send();
}

// function: remove a row and remove data in database

function removeRow(row) {
  console.log("remove function");
  // get productID of this row
  const productId = row.querySelector(".Pid").value;
  console.log("Ready to remove product id: ", productId);
  
  let xhr = new XMLHttpRequest();
  xhr.open("GET", "/RemoveProduct?Pid=" + productId, true);
  xhr.responseType = "json";
  
  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
          console.log("Request done");
      try {
        console.log("http status:" + xhr.status);
        if (xhr.status === 200) {
            tbody.removeChild(row); // remove this row
            console.log("Successfully remove items");
            notification();
            window.alert("Successfully remove items");
        } else {
            console.log("HTTP Error: " + xhr.status);
            if (xhr.response && xhr.response.message) {
              // display error message
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

// function: notification sound
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

// event: remove button
table.addEventListener("click", function (event) {
  const target = event.target;
  if (target.classList.contains("removeBtn")) {
    notification();
    if (confirm("Are you sure you want to delete this product?")) {
      const row = target.closest("tr");
      removeRow(row);
    }
  }
});

// event: update button
table.addEventListener("click", function (event) {
  const target = event.target;
  if (target.classList.contains("updateBtn")) {
    notification();
    if (confirm("Are you sure you want to update this product?")) {
        // get productID, name and price of this row
        let tr = target.closest('tr');
        let productID = tr.querySelector('.Pid').value;
        let productName = tr.querySelector('input[name="productName"]').value;
        let price = tr.querySelector('input[name="productPrice"]').value;
        update(productID,productName,price);
    }
  }
});

// event: add promotion button
table.addEventListener("click", function (event) {
  const target = event.target;
  if (target.classList.contains("addPromotionBtn")) {
    const row = target.parentNode.parentNode;
    const productID = row.querySelector('[name="productID"]').value;
    notification();
    const promotionPrice = prompt("Enter promotion price:");
    if (!promotionPrice) {
      return;
    }
    const startDate = prompt("Enter start date (yyyy-mm-dd):");
    if (!startDate) {
      return;
    }
    const endDate = prompt("Enter end date (yyyy-mm-dd):");
    if (!endDate) {
      return;
    }
    addPromotion(productID, promotionPrice, startDate, endDate);
  }
});

window.addEventListener("load", function() {
    console.log("Loading the page");
    displayProduct();
  });