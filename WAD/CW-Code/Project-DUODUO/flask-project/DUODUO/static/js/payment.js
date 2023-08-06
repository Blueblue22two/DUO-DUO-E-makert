var alipayImg = document.getElementById("alipay");
var wechatImg = document.getElementById("wechat");
// get value
var price = document.getElementById("pri").value;
var Pid =document.getElementById('Pid').value;
var number =document.getElementById('num').value;
var total = price*number;

// function : call alipay api
function alipay(){
  let xhr = new XMLHttpRequest();
  var user = getCookie('username');
  console.log("User name:",user);
  let data = { "total": total ,
    "Pid":Pid,
    "Username":user,
    "price":price,
    "number":number
  };
  xhr.open("POST", "/alipay_pay", true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      console.log("Request done");
      try {
        console.log("http status:" + xhr.status);
        if (xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);
            var websiteUrl = data.pay_url;
            console.log(websiteUrl);
            // window.alert(websiteUrl);
            window.location.href = websiteUrl;
        }else if(xhr.status === 202){
          // payment failed
          console.log("Payment failed");
          window.alert("Payment failed");
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

// function : call wechat payment api(做不完)
function wechat(){
  // 将total传入到wechat payment接口中
  // 如果接口返回成功，则将消费记录存入数据库
  // 返回失败，则弹窗显示失败
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

// event: Alipay
alipayImg.addEventListener("click", function() {
  console.log("Alipay function...");
  alipay();
});

// event: Wechat pay
wechatImg.addEventListener("click", function() {
  alert("WeChat pay function...");
});

// event
window.addEventListener("load", function() {
  console.log("Loading the page");
  console.log("Proudtc id: ",Pid);
  console.log("total price: ",total);
  // 获取price_div元素
  var priceDiv = document.getElementById('price_div');
  // 更新price_div元素的内容
  priceDiv.innerHTML = '<span>$</span>' + total;
});

