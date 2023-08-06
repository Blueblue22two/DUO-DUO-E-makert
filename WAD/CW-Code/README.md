# DUO DUO Market  
## Introduction:
>  This project is an e-commerce website that can support **customers** and **vendors**  
一个支持**消费者**与**商家**两种类型用户使用的电商网站  
> 
> - 买家 Customer：  
Buyers can create accounts with a username, password, address, email, phone number and buy one or more products, like or dislike it, post comments, and read comments other buyers have posted.  
买家可以用用户名、密码、地址、电子邮件、电话号码创建账户，购买一个或
多个产品，like或dislike这个产品，对产品发表评论，并阅读其他买家发表的评论，修改购物车，修改个人资料(尚未实现该功能)
> 
> - 卖家 vendor：  
The vendors also have accounts with username, password, email, address and also phone number. vendor can add their products with the quantity and the price or Remove a products, and modify the product information and set promotion.
供应商也有用户名，密码，电子邮件，地址和电话号码的帐户，修改个人资料，可以在它们的店店铺内上架、下架商品以及修改商品信息新建促销活动。

> - 产品 product:  
The products are divided into categories containing products from the same type has a name, description, price, vendor name, number of likes/dislikes, user’s comments and an “add to cart” button  
产品被分为包含相同类型产品的类别，具有名称、描述、价格、供应商名称、喜欢/不喜欢的数量、用户话可以发表评论，将商品添加到购物车 
  
> There are also check logistics, message notification systems  
还有查看物流，消息通知等系统  
--- 

## Technology:  
- Python (version:**`3.9.12`**)  
- Flask (version:**`1.1.2`**)  
- Mysql (version:**`8.0`**)  
- Html & css  
- Javascript & jQuery  

### other `sdk` or `plug-in`:  
- encrypt: `pip install pycryptodome` (version:**`3.0.10`**)  
- flask-mysql-connector: `pip install flask-mysql-connector` (version:**`1.1.0`**)  
- Alipay: `pip install alipay-sdk-python==3.2.0` (version:**`3.2.0`**)  
- wechat payment:

<!-- - flask-cors `pip install -U flask-cors -i https://pypi.tuna.tsinghua.edu.cn/simple`(跨域)   -->
--- 

## Project file structure:  
Inside the folder **`WAD\CW-Code\Project-DUODUO`**,there have two sub-folder.  
### Databases:  
> This folder stores sql files and data for the database.  
For more information, please go to 'WAD\CW-Code\Project-DUODUO\Databases' and read the file `Read_Database.md`.  

> 该文件夹中存储该数据库的sql文件与数据。  
想知道详细情况，请进入`WAD\CW-Code\Project-DUODUO\Databases`中阅读文件`Read_Database.md`。  

### flask-project:  
> This folder stores the code for the website.  
> 该文件夹中存储了网站的代码。  
- **`static`** folder: 存储静态文件如`css,js,image`等等。
- **`template`** folder: 存放`html`文件。  
- **`app.py`**: main program of the flask.
---

## Connect to the mysql database:  
###  import data:  
1. Create a new database called `duoduo`  
2. import all `.sql` file in `WAD\CW-Code\Project-DUODUO\Databases\duoduo\Dump20230604`.    

### Configuration:  
Replace the previous code with the following code in `app.py`.
```python
    # create mysql object
    app.config['MYSQL_USER'] = 'root' # input your mysql user name
    app.config['MYSQL_PASSWORD'] = 'password' # input your mysql password
    app.config['MYSQL_DATABASE'] = 'duoduo'
    mysql = MySQL(app)

    # set the secret key
    app.secret_key = '09blue[b23b+al122' # set the secret key(you can modify it)
```  

### Initialize a connector:  
**example** of how ti initialize a connector object:
```python  
    # create a connector object  
    conn = mysql.connection
    cursor = conn.cursor()

    # operation...

    # Make sure to close the connection after the operation
    # close connect
    cursor.close()
    conn.close()
```  

> 你可以访问flask-mysql-connector文档链接，查看具体如何使用：  
You can check out the flask-mysql-connector documentation link below： 
>  
> URL:`https://pypi.org/project/flask-mysql-connector/`.  

--- 

## config <font color="blue">Alipay</font>:  
> 本支付功能是调用了支付宝的 **沙箱功能(sandbox)** 用于测试，并没有使用真的金额支付，若需要请前往支付宝开发平台观看文档自行修改。  

### Preparation:  
- 首先需要前往 支付宝开发平台 注册/登录 支付宝账号，网站url`https://open.alipay.com/`  
- 前往`控制台`界面，然后在下方找到`沙箱`界面，进入后找到下面几个信息并保存起来:
- - `APPID`  
- - `应用公钥(Application public key)`  
- - `应用私钥(Application private key)`  
- - `支付宝公钥(Alipay public key)`  

### Configuration  
> config the Alipay api inside the **`app.py`**.  
在主程序`app.py`内配置支付宝api。  

> Replace the code in app.py with the code you changed.  
> 请将下面你修改的代码替换掉app.py中原来的代码。
``` python
    #import alipay sdk 
    from alipay import AliPay

    # Initialize Alipay
    # 初始化alipay
    appID="2021000122690086" # Input your appID
    ALIPAY_URL = 'https://openapi.alipaydev.com/gateway.do' # gateway address

    # paste your application private key between the BEGIN and END
    # 在下面给定的BEGIN与END中间粘贴你的应用私钥
    private_key="""-----BEGIN RSA PRIVATE KEY-----

    -----END RSA PRIVATE KEY-----"""

    # paste your Alipay public key between the BEGIN and END
    # 在下面给定的BEGIN与END中间粘贴你的支付宝公钥
    alipay_public_key="""-----BEGIN PUBLIC KEY-----

    -----END PUBLIC KEY-----"""

    # Initialize the Alipay object
    alipay = AliPay(
        appid=appID,
        app_private_key_string=private_key,
        alipay_public_key_string=alipay_public_key,
        app_notify_url = None, # 回调地址 callback address
        sign_type="RSA2", # 签名加密算法 Encryption algorithm Name
        debug=True # 调用支付宝沙箱(call alipay sandbox api)
    )
```  
> Example of Generate payment address  
例子：如何生成支付地址  
```python
    # The following code is in 
    # def aliPay()
    # please modify it

    # Generate the payment address and return the order payment address on success
    # 生成支付地址,成功后会返回订单支付地址 
    order_string = alipay.api_alipay_trade_page_pay(
        out_trade_no = order_num, # order number
        total_amount=total, # total price
        subject='Vendor Collection', # order name,you can change it
        return_url="http://127.0.0.1:5000",
        notify_url="http://127.0.0.1:5000/alipay_notify"
    )
```

> 支付宝官方文档链接:`https://opendocs.alipay.com/open/270/105899`  
> The alipay document url: `https://opendocs.alipay.com/open/270/105899`  


## Configuring environments  
1. Create a **virtual enviorment** (following the step):  
```
    // open cmd
    pip install virtualenv
    // install virtualenv,which is used to create a virtual envoirment
```
2. Find a suitable path and enter it：
```
    // make sure go to this path in cmd

    virtualenv flask-project
    // 将在文件夹中创建新的虚拟环境
    // 在项目中出现一个'flask-project'文件夹
    // A new virtual environment will be created in the folder
    // A folder called 'flask-project' has been created in the project
    
    cd flask-project 
    // 进入到venv文件夹中

    scripts\activate
    // 激活环境

    pip install Flask
    // 安装 flask
    pip install flask mysql-connector-python  
    // 安装与mysql的连接插件  
```  
3. Paste the files inside the `flask-project` folder,and run this project with **`cmd`**  
``` 
    //go to cmd inside the `DUODUO` folder and execute the following command:

    set FLASK_ENV=development
    // 输入这个命令启动开发模式 (如果不需要修改代码可以省略这个步骤)  
    // Enter this command to start development mode(You can skip this step if you don't need to change the code.)

    python -m flask run
    // 运行flask项目
    // run this project

    // 如果显示Running on ..url ，则说明运行成功。  
    // If Running on.. url, the command is successfully executed. 

    // 浏览器输入该网址http://127.0.0.1:5000
    // Enter the URL http://127.0.0.1:5000 in browser
    
    在cmd终端内按ctrl+c就可以结束项目运行
    // if you want to stop this project, use 'ctrl+c' in cmd
```
---  

## The knowledge that I have learned:  
1. DOM: 
> How to use the DOM to find, update, add, and remove elements in an HTML file.  
2. JS & jQuery:  
> add a event,  find element, **AJAX**`XMLHttpRequest`  
3. Flask:  
> `request`, `response`, `cookie`, `session`,`route()`,`template`,`redirect()`  
4. flask_mysql_connector:  
> How to use python to control the mysql database
5. 
> How does a web site run between the browser and the server?**(request and response)**  
> how to send and receive information?(**xmlhttprequset**,**make_response()**,**flash()**)
> what kind of data is there **(plain text,xml,Json)**  
> How to keep user data safe? **(cookie,session)**  
> How to jump to another page? (**redirect()**,**window.location.href**)
6. Security:
> When the user password is stored in the data, it cannot be stored in plaintext and needs to be encrypted.