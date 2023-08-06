var cartTable = document.getElementById('cartTable');
var selectAllCheckbox = document.getElementById('selectAllCheckbox');
var removeSelectedButton = document.getElementById('removeSelectedButton');
var totalPriceInput = document.getElementById('totalPrice');
var payButton = document.getElementById('payButton');

// Get the data from the shopping cart and display it
function showCart(){
    var user = getCookie('username');
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "/Cart?name="+user, true);
    xhr.responseType = "json";
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          console.log("Request done");
          closeLoading();
          try {
            console.log("http status:" + xhr.status);
            if (xhr.status === 200) {
              let cartData = xhr.response;
              let cartItems = cartData.items;
              let tbody = document.getElementById("cartTable");
              // Iterate over the items and add them to the table one by one
              for (let i = 0; i < cartItems.length; i++) {
                let item = cartItems[i];
                // create html element
                let tr = document.createElement("tr");
                let td1 = document.createElement("td");
                let inputCheckbox = document.createElement("input");
                inputCheckbox.setAttribute("type", "checkbox");
                inputCheckbox.setAttribute("class", "itemCheckBox");
                td1.appendChild(inputCheckbox);
                tr.appendChild(td1);
                let td2 = document.createElement("td");
                td2.innerText = item.name;
                tr.appendChild(td2);
                let td3 = document.createElement("td");
                td3.innerText = "$" + item.price;
                tr.appendChild(td3);
                let td4 = document.createElement("td");
                let inputQuantity = document.createElement("input");
                inputQuantity.setAttribute("type", "number");
                inputQuantity.setAttribute("class", "itemQuantity");
                // TODO: 
                // Since the ability to change the number of items in the shopping cart is not yet fully implemented,
                // These two lines of code can be ignored for now
                // inputQuantity.setAttribute("min", "1");
                // inputQuantity.setAttribute("max", "99");
                // 
                inputQuantity.setAttribute("value", item.quantity);
                inputQuantity.setAttribute('readonly', 'true');
                td4.appendChild(inputQuantity);
                tr.appendChild(td4);
                tbody.appendChild(tr);
              }
              calculateTotalPrice();
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

// change Quantity
function changeQuantity(){
  // TODO: In the Quantity field, check if the user has changed the quantity
  // AND store the Quantity in database
}

// calculate total price
function calculateTotalPrice() {
  let totalPrice = 0;
  const itemCheckboxes = document.getElementsByClassName('itemCheckBox');
  const itemQuantities = document.getElementsByClassName('itemQuantity');
  for (let i = 0; i < itemCheckboxes.length; i++) {
    if (itemCheckboxes[i].checked) {
      const price = parseFloat(itemCheckboxes[i].parentNode.nextElementSibling.nextElementSibling.innerText.slice(1));
      const quantity = parseInt(itemQuantities[i].value);
      totalPrice += price * quantity;
    }
  }
  totalPriceInput.value = totalPrice.toFixed(2);
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

// remove selected product from cart
removeSelectedButton.addEventListener('click', () => {
  Loading();
  if (confirm('Are you sure you want to remove selected items?')) {
    const cartTableBody = document.getElementById('cartTable');
    const itemCheckboxes = document.getElementsByClassName('itemCheckBox');
    var selectedItems = [];
    var user = getCookie('username');

    // store all of selected product name
    for (let i = 0; i < itemCheckboxes.length; i++) {
      if (itemCheckboxes[i].checked) {
        const itemName = itemCheckboxes[i].parentElement.nextElementSibling.innerHTML.trim();
        selectedItems.push(itemName);
      }
    }
    const data = JSON.stringify({ "username": user, "items": selectedItems });
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/Cart", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.responseType = "json";

    xhr.onload = function() {
      if (xhr.readyState === xhr.DONE) {
        console.log("request done");
        closeLoading();
        // When a successful response is received, the data is removed from the page
        if (xhr.status === 200) {
          // loop through each selected checkbox and remove its parent row from the table
          for (let i = 0; i < itemCheckboxes.length; i++) {
            if (itemCheckboxes[i].checked) {
              const row = itemCheckboxes[i].parentNode.parentNode;
              cartTableBody.removeChild(row);
            }
          }
          console.log("remove successful");
        } else {
          console.log("Error occurred during removing items from the cart");
          if (xhr.response && xhr.response.message) { // display error message
            console.log("HTTP Error Message: " + xhr.response.message);
          }
        }
      }
      calculateTotalPrice();
    }
    xhr.send(data);
  }else{
    closeLoading();
  }
});

// calculate the total price when changing the quantity
cartTable.addEventListener('change', (event) => {
  if (event.target.classList.contains('itemCheckBox') || event.target.classList.contains('itemQuantity')) {
    calculateTotalPrice();
  }
});


// payment
payButton.addEventListener('click', () => {
  // TODO: 实现支付功能
  alert('Not implemented yet.');
});

// select all product
selectAllCheckbox.addEventListener('click', () => {
  const itemCheckboxes = document.getElementsByClassName('itemCheckBox');
  for (let i = 0; i < itemCheckboxes.length; i++) {
    itemCheckboxes[i].checked = selectAllCheckbox.checked;
  }
  calculateTotalPrice();
});

window.addEventListener("load", function() {
  console.log("Loading the page");
  Loading();
  setTimeout(showCart,200);
});

