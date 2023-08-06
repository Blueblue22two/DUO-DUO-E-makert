from flask import Flask,render_template,request,jsonify, session, request, escape, Response, flash, url_for, redirect
from flask_mysql_connector import MySQL
from flask import make_response, json
from alipay import AliPay
from flask_cors import CORS # not use
from flask_cors import cross_origin # not use
import datetime
import os
import base64
import ssl
ssl._create_default_https_context = ssl._create_unverified_context


# Initialize flask
app = Flask(__name__)
CORS(app, origins="http://127.0.0.1:5000") # not use

# create mysql object
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'password' # inout your database password
app.config['MYSQL_DATABASE'] = 'duoduo'
mysql = MySQL(app)

# set the secret key
app.secret_key = '09blue[b23b+al122'

# config: alipay
appID="alipayID" # id of Alipay ID
ALIPAY_URL = 'https://openapi.alipaydev.com/gateway.do' # gateway address

# application private key
private_key="""-----BEGIN RSA PRIVATE KEY-----

-----END RSA PRIVATE KEY-----"""
alipay_public_key="""-----BEGIN PUBLIC KEY-----

-----END PUBLIC KEY-----"""

# Initialize the Alipay object
alipay = AliPay(
    appid=appID,
    app_private_key_string=private_key,
    alipay_public_key_string=alipay_public_key,
    sign_type="RSA2",
    debug=True  # sandbox
)

# page of index
# function: Log in
@app.route('/',methods=['GET','POST'])
def index_page():
    if request.method == 'POST':
        print("-> receive a post from client")
        username = request.form['username']
        password = request.form['password']
        print('username: '+username)
        print('password: '+password)
        # check data
        if not username or not password:
            print('Unvalid data')
            response_data = {'success': False, 'message': 'Unvalid data'}
            response = make_response(jsonify(response_data), 400)
            return response
        # connect with database
        conn = mysql.connection
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM customers WHERE customername = %s', (username,))
        row = cursor.fetchone()

        # close connect
        # cursor.close()
        # conn.close()
        if row:
            # Check that the corresponding passwords are the same
            if row[2] == password:
                type = 'customer'
                response_data = {'success': True, 'message': 'Log in successful'}
                response = make_response(jsonify(response_data), 200)
                response.set_cookie('username', username)
                response.set_cookie('password', password)
                response.set_cookie('type',type)
                return response
            else:
                response_data = {'success': False, 'message': 'Incorrect password'}
                response = make_response(jsonify(response_data), 400)
                return response
        else:
            cursor.execute('SELECT * FROM vendors WHERE vendor_name = %s', (username,))
            row = cursor.fetchone()
            if row:
                # Check that the corresponding passwords are the same
                if row[2] == password:
                    type = 'vendor'
                    response_data = {'success': True, 'message': 'Log in successful'}
                    response = make_response(jsonify(response_data), 200)
                    response.set_cookie('username', username)
                    response.set_cookie('password', password)
                    response.set_cookie('type',type)
                    return response
                else:
                    response_data = {'success': False, 'message': 'Incorrect password'}
                    response = make_response(jsonify(response_data), 400)
                    return response
            else:
                response_data = {'success': False, 'message': 'Username not found'}
                response = make_response(jsonify(response_data), 400)
                return response
    else:
        return render_template('Index.html')

# page of registration
@app.route('/Register')
def register_page():
    return render_template('Register.html')

# register function
@app.route('/register', methods=['POST'])
def register():
    # get user input
    if request.method == 'POST':
        data = request.get_json()
        print('Request method:', request.method)
        print('Request headers:', request.headers)
        print("Here is data:", data) # display the data
        if data is not None and isinstance(data, dict):
            print("data is valid !")
            username = data.get('username')
            password = data.get('password')
            phone_number = data.get('phone')
            email_address = data.get('email')
            address = data.get('address')
            user_type = data.get('type')
        else:
            print("Invalid data !")
            # return failed response
            response_data = {'success': False, 'message': 'Invalid request parameters.'}
            response = make_response(jsonify(response_data),400)
            return response

    conn = mysql.connection # connect with mysql
    cursor = conn.cursor()

    error_msg = ''
    # check if there are same user name
    check_user_sql = "SELECT * FROM customers WHERE customername=%s"
    check_vendor_sql = "SELECT * FROM vendors WHERE vendor_name=%s"
    if user_type == 'customer':
        cursor.execute(check_user_sql, (username,))
    elif user_type == 'vendor':
        cursor.execute(check_vendor_sql, (username,))

    # already have same name, then send error message
    if cursor.fetchone() is not None:
        error_msg = f'{username} already have same user name,please change another name'
        print(error_msg)
        cursor.close()
        conn.close()
        # return failed response
        response_data = {'success': False, 'message': error_msg}
        response = make_response(jsonify(response_data), 400)
        return response
    else:
        if user_type == 'customer':
            insert_sql = "INSERT INTO customers (customername, password, address,email,phone) VALUES (%s, %s, %s, %s, %s)"
            val = (username, password, address, email_address, phone_number)

            # Create a shopping cart for the user
            cursor.execute(insert_sql, val)
            conn.commit()
                # get customer_id
            check_sql="SELECT customer_id FROM customers WHERE customername = %s;"
            cursor.execute(check_sql, (username,))
            result = cursor.fetchone()
            if result:
                customer_id = result[0]
            else:
                customer_id = None
                print("error - customer not found")
                return
            insert_sql = "INSERT INTO cart (customer_id) VALUES (%s)"
            cursor.execute(insert_sql, (customer_id,))
            conn.commit() # The changes are committed and the database is updated
        elif user_type == 'vendor':
            insert_sql = "INSERT INTO vendors (vendor_name, password, address,email,phone) VALUES (%s, %s, %s, %s, %s)"
            val = (username, password, address, email_address, phone_number)
            cursor.execute(insert_sql, val)
            conn.commit() # The changes are committed and the database is updated

        print("Data records completed")
        cursor.close()
        conn.close()
        response_data = {'success': True, "redirectUrl": url_for('index_page')}
        response = make_response(jsonify(response_data), 200)
        response.set_cookie('username', username)
        response.set_cookie('password', password)
        response.set_cookie('type',user_type)
        # set session
        # session['username'] = username
        return response

# page of Category
@app.route('/Categories')
def categories_page():
    category = request.args.get('category')
    print('category: ',category)
    return render_template('Categories.html',category=category)

# page of Promotions
@app.route('/Promotions')
def promotions_page():
    return render_template('Promotions.html')

# page of vendor to manage their store
@app.route('/Store')
def Store_page():
    # get store id and jump to store
    id = request.args.get('id')
    print("store id: ",id)
    return render_template('Store.html',id = id)

# function: Check if the store has already been created
# If the vendor has not created a store, go to the interface to create a store
@app.route('/checkStore',methods=['POST'])
def check_store():
    if request.method == 'POST':
        data = request.get_json()
        print('Request method:', request.method)
        print('Request headers:', request.headers)
        print("Here is data:", data) # display the data
        username = data.get('username')
        # connect with mysql
        conn = mysql.connection 
        cursor = conn.cursor()
        # get vendor_id
        check_sql = "SELECT vendor_id FROM vendors WHERE vendor_name = %s"
        cursor.execute(check_sql, (username,))
        vendorid = cursor.fetchone()
        print('vendorid:', vendorid)

        check_sql="SELECT COUNT(*) FROM stores WHERE vendor_id = %s"
        cursor.execute(check_sql, (vendorid[0],))
        res = cursor.fetchone()
        print('res: ',res)
        cursor.close()
        conn.close()
        if(res[0]!=0): #already have store,jump to store page
            print('Already have a store')
            print('url',url_for('Mystore_page'))
            response_data = {'success': True, "redirectUrl": url_for('Mystore_page')}
            response = make_response(jsonify(response_data), 200)
            return response
        else:
            print('No existing store was found')
            print('url',url_for('regis_Mystore_page'))
            response_data = {'success': False, "redirectUrl": url_for('regis_Mystore_page')}
            response = make_response(jsonify(response_data), 302)
            return response
    else:
        return 

# page of create a store
# function: create a store (name and LOGO)
@app.route('/regisMyStore',methods=['GET','POST'])
def regis_Mystore_page():
    if request.method == 'POST':
        # get data and file
        file = request.files['storeImage']
        storeName = request.form.get('name')
        username = request.form.get('username')
        print('Request method:', request.method)
        print('Request headers:', request.headers)
        print("Store Name:", storeName)
        print("Username:", username)
        print("File:", file.filename)
        # create a store file
        path = r'D:\WAD\CW-Code\Project-DUODUO\Databases\Stores'
        folder_path = os.path.join(path, storeName) # join path and folder name
        if not os.path.exists(folder_path): # check if folder already exists
            os.makedirs(folder_path) # create folder
            os.makedirs(os.path.join(folder_path, 'LOGO')) # folder to store image
            os.makedirs(os.path.join(folder_path, 'PRODUCT')) # folder to store product
            logo_folder_path = os.path.join(folder_path, 'LOGO')
        
        # Save the image to the 'LOGO' folder
        store_path = folder_path
        file.save(os.path.join(logo_folder_path, file.filename))
        file_path = os.path.join(logo_folder_path, file.filename) # get path of image
        print("logo path:",file_path)

        # connect with mysql
        conn = mysql.connection 
        cursor = conn.cursor()

        check_sql = "SELECT vendor_id FROM vendors WHERE vendor_name = %s"
        cursor.execute(check_sql, (username,))
        result = cursor.fetchone()
        if result is None:
            # handle error
            response_data = {'success': False, 'message': 'Vendor not found'}
            return make_response(jsonify(response_data), 400)
        
        vendorid = result[0]
        # Create store
        insert_sql = "INSERT INTO stores (store_name, vendor_name, vendor_id, image_url,store_url) VALUES (%s, %s, %s,%s,%s)"
        cursor.execute(insert_sql, (storeName,username,vendorid,file_path,store_path))
        conn.commit()
        cursor.close()
        conn.close()
        response_data = {'success': True,  "redirectUrl": url_for('Mystore_page')}
        response = make_response(jsonify(response_data), 200)
        return response
    else:
        return render_template('Create_Store.html')
    
# page of vendor to manage their store
@app.route('/MyStore')
def Mystore_page():
    return render_template('My_store.html')

# function: Get data statistics for the store
# function: jump to Mystore page
@app.route('/getStoreData',methods=['GET','POST'])
def get_store_data():
    if request.method == 'POST':
        data = request.get_json()
        print('Request method:', request.method)
        print('Request headers:', request.headers)
        print("Here is data:", data) # display the data
        username = data.get('username')
        # connect database
        conn = mysql.connection 
        cursor = conn.cursor()
        # Initialize the default value to 0
        volume = 0
        sales = 0
        num = 0
        # get vendor id
        check_sql="SELECT vendor_id FROM vendors WHERE vendor_name = %s;"
        cursor.execute(check_sql, (username,))
        ven_id = cursor.fetchone()[0]
        if not ven_id:
            response_data = {'success': False,  "message": 'Error - vendor id not found'}
            response = make_response(jsonify(response_data), 400)
            return response
        print("id= ",ven_id)
                
        # get volume
        check_sql="SELECT COUNT(*) AS num_purchase_records, SUM(numbers) AS total_numbers FROM purchase_record WHERE vendor_id = %s;"
        cursor.execute(check_sql, (ven_id,))
        result = cursor.fetchone()
        if result:
            # If not, the value remains the default value of 0
            volume = result[1]
            if(volume==None):
                volume=0
            print("volume= ", volume)

        # get sale
        check_sql="SELECT SUM(price * numbers) AS total FROM purchase_record WHERE vendor_id = %s;"
        cursor.execute(check_sql, (ven_id,))
        result = cursor.fetchone()
        if result:
            sales = result[0]
            if(sales==None):
                sales=0
            print("sales= ", sales)

        # get num
        # first to get store_id and store_name
        check_sql = "SELECT store_id,store_name FROM stores WHERE vendor_id =%s"
        cursor.execute(check_sql, (ven_id,))
        result = cursor.fetchone()
        if result:
            stoer_name = result[1]
            store_id = result[0]
            print("store_id= ", store_id," | stoer_name= ",stoer_name)
        else:
            cursor.close()
            conn.close()
            print('Error - store id not found')
            response_data = {'success': False,  "message": 'Error - store id not found'}
            response = make_response(jsonify(response_data), 400)
            return response
        
        check_sql="SELECT COUNT(*) FROM products WHERE store_id = %s;"
        cursor.execute(check_sql, (store_id,))
        result = cursor.fetchone()
        if result:
            num = result[0]
            if(num==None):
                num=0
            print("num= ", num)

        # send the reponse with json
        cursor.close()
        conn.close()
        print('get data successfully')
        data_dict = {
            "volume": volume,
            "sales": sales,
            "num": num,
            "name":stoer_name,
        }
        response_data = {"success": True, "data": data_dict}
        response = make_response(jsonify(response_data), 200)
        response.headers["Content-Type"] = "application/json" # set header
        return response
    else:
        return render_template('My_store.html')

# function: get all products in this store
@app.route('/allProduct')
def all_product_store():
    storeId = request.args.get('id')
    storeId = int(storeId)
    print("store id: ",storeId)
    # connect database
    conn = mysql.connection 
    cursor = conn.cursor()

    # fetch all products information in this store (product name, price, image_url)
    # Sort in descending order by number of likes
    check_sql = "SELECT name, price, image_url FROM products WHERE store_id = %s ORDER BY likes DESC"
    cursor.execute(check_sql,(storeId,))
    result = cursor.fetchall()
    if result is None:
        print("Error: Didn't find this store")
        cursor.close()
        conn.close()
        response_data = {'success': False, "message": "Error: Didn't find this store"}
        response = make_response(jsonify(response_data), 400)
        return response

    # TODO: fetch the logo and the name of this store
    check_sql="SELECT store_name, image_url FROM stores WHERE store_id = %s"
    cursor.execute(check_sql,(storeId,))
    informations = cursor.fetchone()
    if informations is None:
        print("Error: Didn't find this store")
        cursor.close()
        conn.close()
        response_data = {'success': False, "message": "Error: Didn't find this store"}
        response = make_response(jsonify(response_data), 400)
        return response
    
    print("store name: ",informations[0])

    # Add the data for each itemto the products list
    products=[]
    for row in result:
        with open(row[2], "rb") as f:
            image_data = f.read()
            image_base64 = base64.b64encode(image_data).decode("ascii")
        product = {
            "name": row[0],
            "price": float(row[1]),
            "image": image_base64,
        }
        print("name: ", row[0])
        print("price: ", float(row[1]))
        products.append(product)

    # send response
    cursor.close()
    conn.close()
    print("fetch all products successful!")
    return jsonify({
    'store_name': informations[0],
    'logo': base64.b64encode(open(informations[1], "rb").read()).decode("ascii"),
    'products': products
    })

# function: Fetch speicifc data of store
@app.route('/storeSpecificData')
def store_specific_data():
    # get all product specific data in this store (productid,product name,product price and check is there any new price?)
        vendorName = request.args.get('name')
        print("vendor name:",vendorName)
        # connect database
        conn = mysql.connection 
        cursor = conn.cursor()

        # get store_id and store_name
        check_sql="SELECT store_id,store_name from stores WHERE vendor_name = %s"
        cursor.execute(check_sql, (vendorName,))
        result = cursor.fetchone()
        if result is None:
            print("Error: Didn't find this store")
            cursor.close()
            conn.close()
            response_data = {'success': False,  "message": 'Error: Didn find this store'}
            response = make_response(jsonify(response_data), 400)
            return response
            
        store_id = result[0]
        store_name = result[1]
        print("store id: ",store_id," |  store name: ",store_name)
            
        # get all product information in this store (product_id, product name, price)
        get_products_sql = "SELECT product_id, name, price FROM products WHERE store_id = %s"
        cursor.execute(get_products_sql, (store_id,))
        products = cursor.fetchall()
        response_data = [] # json data

        for product in products:
        # Iterate over all products in the store and 
        # check if the corresponding data exists in the discount_promotion process (if the product_id exists).
            check_sql = "SELECT new_price FROM discount_promotion WHERE product_id = %s"
            cursor.execute(check_sql, (product[0],))
            promoPrice = cursor.fetchone()
            if promoPrice is None:
                response_data.append({
                'product_id': product[0],
                'name': product[1],
                'price': float(product[2]),
                'new_price':'No',
                'store_id': store_id,
                'store_name': store_name
                })
                print("id: ",product[0]," |  name:",product[1]," | new_price: ",'No')
            else:
                response_data.append({
                'product_id': product[0],
                'name': product[1],
                'price': float(product[2]),
                'new_price':float(promoPrice[0]),
                'store_id': store_id,
                'store_name': store_name
                })
                print("id: ",product[0]," |  name:",product[1]," | new_price: ",promoPrice[0])
        
        # return all information in response
        cursor.close()
        conn.close()
        print("fetch all")
        response_data = {'success': True, "products": response_data}
        response = make_response(jsonify(response_data), 200)
        print("response_data:", response_data)
        return response

# page of modify product information
@app.route('/ModifyPage')
def Modify_page():
    return render_template('Modify_Product.html')

# page of vendor to add product
# function: add a product (name, description, price, image1, image2)
@app.route('/AddProduct',methods=['GET', 'POST'])
def Add_page():
    if request.method == 'POST':
        # get data and file
        productName = request.form.get('productname')
        username = request.form.get('username')
        price = request.form.get('price')
        type = request.form.get('type')
        description = request.form.get('description')
        file1 = request.files['Image1']
        file2 = request.files['Image2']
        print('Request method:', request.method)
        print('Request headers:', request.headers)
        print("Store Name:", productName)
        print("Username:", username)
        print("price: ",price)
        print("type: ",type)
        print('Description: ',description)
        print("File1:", file1.filename)
        print("File2:", file2.filename)
        # select store id and store name
        print('- strat to record data -')
        conn = mysql.connection 
        cursor = conn.cursor()
        # get store_id
        check_sql="SELECT store_id,store_name FROM stores WHERE vendor_name = %s;"
        cursor.execute(check_sql, (username,))
        result = cursor.fetchone()
        store_id = result[0]
        store_name = result[1]
        if not store_id:
            cursor.close()
            conn.close()
            response_data = {'success': False,  "message": 'Error - store id not found'}
            response = make_response(jsonify(response_data), 400)
            return response
        print("store id= ",store_id)
        print("store name= ",store_name)

        # find the file of this store

        # 请更改此处路径到合适的位置
        path = r'D:\WAD\CW-Code\Project-DUODUO\Databases\Stores'
        path = os.path.join(path, store_name)
        folder_path = os.path.join(path, 'PRODUCT')
        # storing images
        folder_path = os.path.join(folder_path, productName)
        # check if folder already exists
        if os.path.exists(folder_path): 
            # same name of product name, return error
            print('Already have same product name')
            cursor.close()
            conn.close()
            response_data = {'success': False,  "message": 'Already have same product name,please change another name'}
            response = make_response(jsonify(response_data), 400)
            return response
        
        os.makedirs(folder_path)
        file1.save(os.path.join(folder_path, file1.filename))
        file2.save(os.path.join(folder_path, file2.filename))
        # get path of image
        file1_path = os.path.join(folder_path, file1.filename) 
        file2_path = os.path.join(folder_path, file2.filename)
        print("image1 path:",file1_path)
        print("image2 path:",file2_path)
        # promotion_id=likes=dislikes=0
        insert_sql = "INSERT INTO products (name, description, price, store_id, category_name, promotion_id, image_url, image1_url, likes, dislikes) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
        cursor.execute(insert_sql, (productName, description, price, store_id, type, 0, file1_path, file2_path, 0, 0))
        conn.commit()
        cursor.close()
        conn.close()
        #return reponse
        print('-> record successfully! ')
        response_data = {'success': True,  "redirectUrl": url_for('Mystore_page')}
        response = make_response(jsonify(response_data), 200)
        return response
    else:
        return render_template('Add_product.html')
    
# function: remove product (product id)
@app.route('/RemoveProduct')
def Remove_product():
    product_id = request.args.get('Pid')
    print("product id: ",product_id)
    # connect with database
    conn = mysql.connection
    cursor = conn.cursor()
    # TODO: 删除在products中对应的product_id的数据
    delete_sql="DELETE FROM products WHERE product_id = %s"
    cursor.execute(delete_sql, (product_id,))
    # TODO: 删除成功则返回成功的response，中间哪里发送错误则返回错误信息的response
    conn.commit()
    cursor.close()
    conn.close()
    print('-> remove successfully! ')
    response_data = {'success': True,  "message":"remove successfully!" }
    response = make_response(jsonify(response_data), 200)
    return response

# function: update product information (productID, productName, price)
@app.route('/UpdateProduct')
def Update_product():
    product_id = request.args.get('Pid')
    name = request.args.get('name')
    price = request.args.get('price')
    print("product id: ",product_id)
    print("product name: ",name)
    print("price: ",price)
    # TODO: update products

    # connect with database
    conn = mysql.connection
    cursor = conn.cursor()
    update_sql = "UPDATE products SET name = %s, price = %s WHERE product_id = %s"
    cursor.execute(update_sql, (name,price,product_id))
    conn.commit()
    cursor.close()
    conn.close()
    # return response
    print("update successfully!")
    response_data = {'success': True,  "message":"update successfully!" }
    response = make_response(jsonify(response_data), 200)
    return response

    
# function: add a Promotion(store id, product id, new price, start date, end date)
@app.route('/AddPromotion', methods=['POST'])
def add_promotion():
    data = request.get_json()
    store_id = data.get('Sid')
    product_id = data.get('productID')
    new_price = data.get('price')
    start_date = data.get('start_date')
    end_date = data.get('end_date')

    # connect with database
    conn = mysql.connection
    cursor = conn.cursor()

    # insert or update promotion information
    cursor.execute('SELECT * FROM discount_promotion WHERE store_id=%s AND product_id=%s', (store_id, product_id))
    if cursor.fetchone():
        cursor.execute('UPDATE discount_promotion SET start_date=%s, end_date=%s, new_price=%s WHERE store_id=%s AND product_id=%s',(start_date, end_date, new_price, store_id, product_id))
    else:
        cursor.execute('INSERT INTO discount_promotion (store_id, product_id, start_date, end_date, new_price) VALUES (%s, %s, %s, %s, %s)',(store_id, product_id, start_date, end_date, new_price))
    conn.commit()
    cursor.close()

    # return success response
    return jsonify({'success': True}), 200

# page of product
@app.route('/Product')
def Product_page():
    productName = request.args.get('name')
    print("product name: ",productName)
    # connect with database
    conn = mysql.connection
    cursor = conn.cursor()
    check_sql = "SELECT product_id, description, price, image_url, image1_url, likes, dislikes FROM products WHERE name = %s"
    cursor.execute(check_sql, (productName,))
    result = cursor.fetchone()
    product_id = result[0]
    description = result[1]
    price = result[2]
    image_url = result[3]
    image1_url = result[4]
    print("image url:",image_url)
    print("image1 url:",image1_url)
    likes =result[5]
    dislikes = result[6]
    # Query discount_promotion for product_id and get new_price as discount if product_id exists
    check_sql = "SELECT new_price FROM discount_promotion WHERE product_id = %s"
    cursor.execute(check_sql, (product_id,))
    result = cursor.fetchone()
    discount = 0 # fiscount defalut value is 0
    if result!=None:
        discount = result[0]
    print('discount value : ',discount)
    with open(image_url, "rb") as f1, open(image1_url, "rb") as f2:
        image_data1 = f1.read()
        image_base64_1 = base64.b64encode(image_data1).decode("ascii")
        image_data2 = f2.read()
        image_base64_2 = base64.b64encode(image_data2).decode("ascii")
    cursor.close()
    conn.close()
    return render_template('Product.html', Pid=product_id, name= productName, description=description, price=price, discount=discount, likes=likes, dislikes=dislikes, image1=image_base64_1, image2=image_base64_2)

# function: send a part of product information (category, number)
@app.route('/get_products')
def get_products():
    category = request.args.get('category')
    number = request.args.get('number') # number of products
    number = int(number) # convert to integer
    print("number: ",number)
    
    # connect with database
    conn = mysql.connection
    cursor = conn.cursor()
    if category=='All':
        print('category: none type')
        check_sql = "SELECT name, price, image_url, product_id FROM products ORDER BY RAND() LIMIT {}".format(number)
        cursor.execute(check_sql)
        result = cursor.fetchall()
    else:
        print('category: ',category)
        # select from category table
        check_sql = "SELECT name, price, image_url, product_id FROM products WHERE category_name = %s ORDER BY RAND() LIMIT %s"
        cursor.execute(check_sql, (category, number))
        result = cursor.fetchall()

    products = [] # json data
    # Add the data for each item to the products list
    for row in result:
        with open(row[2], "rb") as f:
            image_data = f.read()
            image_base64 = base64.b64encode(image_data).decode("ascii")
        
        # It checks if there is a discount_promotion for the corresponding product id, 
        # and if there is a discount_promotion, it changes the price to the new_price
        check_sql = "SELECT new_price FROM discount_promotion WHERE product_id = %s"
        cursor.execute(check_sql, (row[3],))
        promoPrice = cursor.fetchone()
        if promoPrice is None:
            product = {
                "name": row[0],
                "price": float(row[1]),
                "image": image_base64,
            }
            print("name: ", row[0])
            print("price: ", float(row[1]))
            products.append(product)
        else:   
            product = {
                "name": row[0],
                "price": float(promoPrice[0]),
                "image": image_base64,
            }
            print("name: ", row[0])
            print("price: ", float(promoPrice[0]))
            products.append(product)
    # send response
    cursor.close()
    conn.close()
    print("fetch products done")
    return jsonify(products)

# function: get all of promotion products
@app.route('/get_promo_products')
def get_promotion_products():
    print("get promotion proudcts function...")
    
    # connect with database
    conn = mysql.connection
    cursor = conn.cursor()
    check_sql = "SELECT product_id, new_price FROM discount_promotion"
    cursor.execute(check_sql)
    result = cursor.fetchall()
    products = [] # json data

    # select product name ,price and image
    # Add the data for each item to the products list
    for row in result:
        check_sql = "SELECT name, image_url, product_id FROM products WHERE product_id = %s"
        cursor.execute(check_sql, (row[0],))
        data = cursor.fetchone()

        with open(data[1], "rb") as f:
            image_data = f.read()
            image_base64 = base64.b64encode(image_data).decode("ascii")
        
        product = {
                "name": data[0],
                "price": float(row[1]),
                "image": image_base64,
            }
        print("name: ", data[0])
        print("price: ", float(row[1]))
        products.append(product)
            
    # send response
    cursor.close()
    conn.close()
    print("fetch promotion products done")
    return jsonify(products)

# function: change the like/dislike number of product (product id, number(1-like,0-dislike) )
@app.route('/setLike')
def set_Like_Dislike():
    id = request.args.get('Pid')
    id = int(id) # convert to integer
    number = request.args.get('num') # number of products
    number = int(number)
    print("number: ",number," || id: ",id)
    if number!=1 and number!=0:
        response_data = {'success': False, "message": "Error: Parameter values not up to spec!"}
        response = make_response(jsonify(response_data), 400)
        return response
    try:
        # connect with database
        conn = mysql.connection
        cursor = conn.cursor()
        if number == 1: # add like 
            update_sql = "UPDATE products SET likes = likes + 1 WHERE product_id = %s"
            cursor.execute(update_sql, (id,))
        else: # add dislike
            update_sql = "UPDATE products SET dislikes = dislikes + 1 WHERE product_id = %s"
            cursor.execute(update_sql, (id,))

        conn.commit()
        response_data = {'success': True, "message": "success"}
        response = make_response(jsonify(response_data), 200)
        print("update successful")
    except Exception as e:
        # handle the exception here, such as logging the error or returning an error message to the client
        response_data = {'success': False, "message": "Error: something wrong with Database"}
        response = make_response(jsonify(response_data), 400)
    finally:  
        # close the database connection
        cursor.close()
        conn.close()
        return response
    
# function: add a product to Cart (customer name, product id, number)
@app.route('/addCart')
def addCart():
    userName = request.args.get('name')
    id = request.args.get('Pid')
    id = int(id) # convert to integer
    number = request.args.get('number') # number of products
    number = int(number)
    print("name: ",userName," || number: ",number," || product id: ",id)
    # get customer ID
    # connect with database
    conn = mysql.connection
    cursor = conn.cursor()
    # get customer id (equal to cart id)
    check_sql = "SELECT customer_id FROM  customers WHERE customername = %s"
    cursor.execute(check_sql, (userName,))
    customer = cursor.fetchone()
    if customer is None:
        print("Dont have this customer")
        return
    customer_id = customer[0]
    customer_id = int(customer_id)
    print("cart id(customer id): ",customer_id)

    # create card items
    insert_sql="INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (%s, %s, %s);"
    cursor.execute(insert_sql, (customer_id, id, number))
    conn.commit()
    cursor.close()
    conn.close()
    response_data = {'success': True, "message": "add successful"}
    response = make_response(jsonify(response_data), 200)
    print("add successful")
    return response

# page of shopping cart
@app.route('/ShoopingCart')
def cart_page():
    return render_template('Cart.html')

# function: change the product list in cart (customer name, items)
@app.route('/Cart',methods=['GET', 'POST'])
def cart(): 
    # remove items in cart
    if request.method == 'POST':  
        print("> start remove function")
        data = request.get_json()
        username = data["username"]
        items = data["items"]
        print("username: ",username)
        try:
            # connect with database
            conn = mysql.connection
            cursor = conn.cursor()

            # get customer id (equal to cart id)
            check_sql = "SELECT customer_id FROM  customers WHERE customername = %s"
            cursor.execute(check_sql, (username,))
            customer = cursor.fetchone()
            if customer is not None:
                customer_id = customer[0]
            else:
                response_data = {'success': False, "message": "Error: Dont have this customer"}
                response = make_response(jsonify(response_data), 400)
                cursor.close()
                conn.close()
                return response
            
            # get all product names from items
            product_names = []
            for item in items:
                product_names.append(item)
            
            # get product_ids using product_names
            product_ids = []
            for name in product_names:
                cursor.execute("SELECT product_id FROM products WHERE name = %s", (name,))
                result = cursor.fetchone()
                if result is not None:
                    product_ids.append(result[0])
                    print("product id: ",result[0])
                else:
                    print("ERROR: Didnt find this product")
                    response_data = {'success': False, "message": "ERROR: Didnt find this product"}
                    response = make_response(jsonify(response_data), 400)
                    cursor.close()
                    conn.close()
                    return response

            # remove the items from cart_items table using the customer_id and product_id
            for id in product_ids:
                cursor.execute("DELETE FROM cart_items WHERE cart_id = %s AND product_id = %s", (customer_id, id,))
                conn.commit()

            response_data = {'success': True, "message": "remove successful"}
            response = make_response(jsonify(response_data), 200)
            print("remove successful")
        except Exception as e:
            print(e)
            # handle the exception here, such as logging the error or returning an error message to the client
            response_data = {'success': False, "message": "Error: something wrong with Database"}
            response = make_response(jsonify(response_data), 400)
        finally:  
            # close the database connection
            cursor.close()
            conn.close()
            return response
        
    # display all items in cart
    else:
        print("> start display function")
        username = request.args.get('name')
        print("user name: ",username)
        try:
            # connect with database
            conn = mysql.connection
            cursor = conn.cursor()

            # get customer id
            check_sql = "SELECT customer_id FROM customers WHERE customername = %s"
            cursor.execute(check_sql, (username,))
            result = cursor.fetchone()
            if result is None:
                response_data = {'success': False, "message": "Error: Don't have this customer"}
                response = make_response(jsonify(response_data), 400)
                cursor.close()
                conn.close()
                return response
            customerId =result[0]
            print("customerID /cart ID: ",customerId)

            # We already know that cart id is equal to customer id
            # fetch all the items in the cart
            check_sql = "SELECT product_id,quantity FROM cart_items WHERE cart_id =  %s"
            cursor.execute(check_sql, (customerId,))
            result = cursor.fetchall() # product_id
            if result is None:
                print("Error: result of select cart_items is none!")
                response_data = {'success': False, "message": "Error: result of select cart_items is none!"}
                response = make_response(jsonify(response_data), 400)

            # fetch the product name and price for product_id
            cartItems = []
            for r in result:
                item = {}
                check_sql = "SELECT name, price FROM products WHERE product_id =  %s"
                cursor.execute(check_sql, (r[0],))
                productResult = cursor.fetchone()
                item['name'] = productResult[0]
                item['price'] = float(productResult[1])
                item['quantity'] = int(r[1])
                cartItems.append(item)
                print("name: ",productResult[0])
                print("price: ",productResult[1])
                print("quantity: ",r[1])
            response_data = {'success': True, 'items': cartItems}
            response = make_response(jsonify(response_data), 200)
            print("Fetch data successfully")
        except Exception as e:
            # handle the exception here, such as logging the error or returning an error message to the client
            print("error!")
            print(e)
            response_data = {'success': False, "message": "Error: something wrong with Database"}
            response = make_response(jsonify(response_data), 400)
        finally:  
            # close the database connection
            cursor.close()
            conn.close()
            return response

# page of orders
@app.route('/PurchaseRecords')
def purchase_records_page():
    return render_template('Purchase_Records.html')

# function of display orders
@app.route('/Records',methods=['POST'])
def purchase_records():
    if not request.is_json:
        return jsonify(errmsg="Invalid request data format"), 400
    data = request.get_json()
    name = data['name']
    type = data['type']
    # TODO: Determine whether the type of type is customer or vendor
    if(type=="customer"):
        # connect with database
        conn = mysql.connection
        cursor = conn.cursor()
        check_sql = ""
    else: # vendor
        # connect with database
        conn = mysql.connection
        cursor = conn.cursor()

    # TODO: select records and return data
    return

# function: search product (type(product/store), keyword)
# function: search store (type(product/store), keyword)
@app.route('/Search',methods=['GET', 'POST'])
def Search():
    if request.method == 'POST':
        data = request.get_json()
        print('Request method:', request.method)
        print('Request headers:', request.headers)
        print("Here is data:", data) # display the data
        type = data.get('type')
        keyword = data.get('keyword')
        # connect with database
        conn = mysql.connection
        cursor = conn.cursor()
        # check is stores or products
        if type=='products':
            products = []
            check_sql = "SELECT name, price, image_url, product_id FROM products WHERE name LIKE %s"
            cursor.execute(check_sql, (f'%{keyword}%',))
            result = cursor.fetchall()
            # Add the data for each item to the products list
            for row in result:
                with open(row[2], "rb") as f:
                    image_data = f.read()
                    image_base64 = base64.b64encode(image_data).decode("ascii")

                # 检测对应的product id是否有discount_promotion，如果有则将price换为促销价格new_price
                check_sql = "SELECT new_price FROM discount_promotion WHERE product_id = %s"
                cursor.execute(check_sql, (row[3],))
                promoPrice = cursor.fetchone()
                if promoPrice is None:
                    product = {
                        "name": row[0],
                        "price": float(row[1]),
                        "image": image_base64,
                    }
                    print("name: ", row[0])
                    print("price: ", float(row[1]))
                    products.append(product)
                else:
                    product = {
                        "name": row[0],
                        "price": float(promoPrice[0]),
                        "image": image_base64,
                    }
                    print("name: ", row[0])
                    print("price: ", float(promoPrice[0]))
                    products.append(product)

            # send response
            cursor.close()
            conn.close()
            return jsonify(products)
        else: # type = store
            stores = []
            # get store id,store name and store logo
            check_sql = "SELECT store_id, store_name, image_url FROM stores WHERE store_name LIKE %s"
            cursor.execute(check_sql, (f'%{keyword}%',))
            result = cursor.fetchall()

            # Add the data for each item to the stores list
            for row in result:
                with open(row[2], "rb") as f:
                    image_data = f.read()
                    image_base64 = base64.b64encode(image_data).decode("ascii")
                store = {
                    "id":row[0],
                    "name": row[1],
                    "image": image_base64,
                }
                print("store id",row[0])
                print("store_name: ", row[1])
                stores.append(store)
                
            # send response
            cursor.close()
            conn.close()
            return jsonify(stores)
    else:
        # return the search page
        return render_template('Search.html')

# page of Comment
@app.route('/Comment')
def Comment_page():
    #  dispaly comment page
    print("Comment_page function")
    Pid = request.args.get('Pid') # product id
    print("product id: ",Pid)
    return render_template('Comment.html',Pid = Pid)

# function: post a comment(customer name, comment, product_id, time)
# function: get all comments (product_id)
@app.route('/getComment',methods=['GET', 'POST'])
def Comment():
    if request.method == 'POST': # post a comment
        print("post comment function")
        data = request.get_json()
        customername = data['customername']
        commentValue = data['commentValue']
        product_id = data['product_id']
        tims = data['tims']

        # connect with database
        conn = mysql.connection
        cursor = conn.cursor()

        # fetch customer id
        cursor.execute("SELECT customer_id FROM customers WHERE customername=%s", (customername,))
        customer_id = cursor.fetchone()[0]
        if customer_id is None:
            print("The user was not found")
            cursor.close()
            conn.close()
            response_data = {'success': False, "message": "The user was not found"}
            response = make_response(jsonify(response_data), 400)
            return response

        # insert
        cursor.execute("INSERT INTO comments (tims, content, customername, customer_id, product_id) VALUES (%s, %s, %s, %s, %s)",(tims, commentValue, customername, customer_id, product_id))
        conn.commit()

        cursor.close()
        conn.close()
        print("insert comment success")
        response_data = {'success': True, "message": "success"}
        response = make_response(jsonify(response_data), 200)
        return response
    
    else: # display all comment
        print("display comment function")
        Pid = request.args.get('Pid') # product id
        if Pid is None:
            raise ValueError("Product ID must be provided")
        print("product id: ",Pid)
        # connect with database
        conn = mysql.connection
        cursor = conn.cursor()

        # TODO: get all comments
        # check_sql= " SELECT customername,content FROM comments WHERE product_id = %s"
        check_sql = " SELECT customername,content,tims FROM comments WHERE product_id = %s"
        cursor.execute(check_sql, (Pid,))
        results = cursor.fetchall()

        if not results:
            print("No comments found for this product")
            cursor.close()
            conn.close()
            response_data = {'success': False, "message": "No comments found for this product"}
            response = make_response(jsonify(response_data), 400)
            return response
        
        cursor.close()
        conn.close()
        comments=[]
        # add all comment to comments
        for c in results:
            print("author: ",c[0]," | comment: ",c[1]," | date: ",c[2])
            comments.append({"author": c[0], "content": c[1],"date":c[2]}) # 将author和content组成一个字典

            # print("author: ",c[0]," | comment: ",c[1])
            # comments.append({"author": c[0], "content": c[1]})
        print("fetch all comments")
        response_data = {'success': True, "comments": comments}
        response = make_response(jsonify(response_data), 200)
        print("response_data:", response_data)
        return response

# page pf payment
@app.route('/payment')
def payment_page():
    Pid = request.args.get('Pid')
    Pid = int(Pid)
    price =  request.args.get('price')
    # price = float(price)
    number = request.args.get('number')
    number = int(number)
    print("Product id: ",Pid)
    print("Price: ",price)
    print("number:",number)
    return render_template('Payment.html',Pid = Pid,price=price,number = number)

# function: call the Alipay api
@app.route('/alipay_pay',methods=['POST'])
@cross_origin()
def aliPay():
    if not request.is_json:
        return jsonify(errmsg="Invalid request data format"), 400
    data = request.get_json()
    total = data['total']
    Pid = data['Pid']
    Pid = int(Pid)
    Username= data['Username']
    price=data['price']
    number=data['number']
    print("total price:",total)
    print("Product id:",Pid)

    # connect with database
    conn = mysql.connection
    cursor = conn.cursor()

    # fetch order id
    cursor.execute("SELECT COUNT(*) AS total_records FROM purchase_record")
    order_num = cursor.fetchone()[0]+200 
    order_num = 21 # test
    print("order_num",order_num)
    
    # fetch product name
    check_sql="SELECT name FROM products WHERE product_id=%s"
    cursor.execute(check_sql, (Pid,))
    Pname = cursor.fetchone()[0]
    print("Proudt name:",Pname)

    cursor.close()
    conn.close()

    # get date and time
    current_datetime = datetime.datetime.now()
    # get date
    current_date = current_datetime.date()
    date_string = current_date.strftime('%Y-%m-%d')
    print("Date:"+date_string)

    # put the data into session
    data_dict = {
        "date": date_string,
        "Pid": Pid,
        "Username": Username,
        "price": price,
        "number": number
    }
    json_data = session.get('json_data', None)
    if json_data is None:
        json_data = json.dumps(data_dict)
        session['json_data'] = json_data
    data_dict = json.loads(json_data)
    
    # Generate the payment address and return the order payment address on success
    # 生成支付地址,成功后会返回订单支付地址 
    order_string = alipay.api_alipay_trade_page_pay(
        out_trade_no=order_num, # order number
        total_amount=total, # total price
        subject='Vendor Collection',
        return_url="http://127.0.0.1:5000",
        notify_url="http://127.0.0.1:5000/alipay_notify"
        # notify_url= url_for('alipay_notify', _external=True)
    )

    # Check if the transaction has been completed
    result = alipay.api_alipay_trade_query(out_trade_no = order_num)
    if result.get("trade_status", "") == "TRADE_SUCCESS":
        print("already paid this!")
        session['has_paid'] = True
        return redirect('/')
    
    # the payment url
    pay_url = f"{ALIPAY_URL}?{order_string}"
    print("url: "+pay_url)
    # return the payment url to front end
    return jsonify({'pay_url': pay_url})

# function: alipay notify of notify_url (insert records to database)
@app.route('/alipay_notify', methods=['POST'])
@cross_origin()
def alipay_notify():
    print("alipay notify function")
    # verify the sign of alipay
    signature = request.form['sign']
    params = request.form.to_dict()
    sign_verified = alipay.verify(params, signature)
    if sign_verified:
        # verify successful
        trade_status = request.form['trade_status']
        out_trade_no = request.form['out_trade_no']
        if trade_status == 'TRADE_SUCCESS':
            # check session
            json_data = session.get('json_data', None)
            if json_data:
                data_dict = json.loads(json_data)
            date_value = data_dict['date']
            Pid_value = data_dict['Pid']
            Username_value = data_dict['Username']
            price_value = data_dict['price']
            number_value = data_dict['number']
            print("product id"+Pid_value)
            handle_payment_success(date_value, Pid_value, Username_value, price_value, number_value)
            session.pop('json_data', None) # delete session
            return 'success'
        else:
            # payment failed or other
            print("Payment failure")
            session.pop('json_data', None)
            return 'failure'
    else:
        # verify failed
        print("verify sign failed")
        return 'failure'

# function: insert record to database
def handle_payment_success(date_value, Pid_value, Username_value, price_value, number_value):
    # connect with database
    conn = mysql.connection
    cursor = conn.cursor()

    # fetch customer_id
    check_sql = "SELECT customer_id FROM customers WHERE customername = %s;"
    cursor.execute(check_sql, (Username_value,))
    customerId = cursor.fetchone()[0]
    # fetch store_id
    check_sql = "SELECT store_id FROM products WHERE product_id = %s;"
    cursor.execute(check_sql, (Pid_value,))
    storeId = cursor.fetchone()[0]
    # fetch vendor id
    check_sql = "SELECT vendor_id FROM stores WHERE store_id = %s;"
    cursor.execute(check_sql, (storeId,))
    vendorId = cursor.fetchone()[0]

    # insert new records
    query = "INSERT INTO purchase_record (customer_id, vendor_id, product_id, date, numbers, price) " \
            "VALUES (%s, %s, %s, %s, %s, %s)"
    values = (customerId, vendorId, Pid_value, date_value, number_value, price_value)
    cursor.execute(query, values)
    conn.commit()
    cursor.close()
    conn.close()
    print("Insert successful")


# Set the static file directory for the application
app.static_folder = 'static'
app.add_url_rule('/js/<path:filename>', endpoint='js', view_func=app.send_static_file)

if __name__ == '__main__':
    app.run(debug=True) # debug
