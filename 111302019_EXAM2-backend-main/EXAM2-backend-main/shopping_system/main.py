from flask import Flask, request, jsonify, render_template, session, redirect, url_for, flash
from datetime import datetime
import sqlite3
import logging
import re 
import os


app = Flask(__name__)
app.secret_key = 'your_very_secret_key_needs_to_be_set_here'

# 路徑修改
def get_db_connection():
    conn = sqlite3.connect('shopping_data.db')
    if not os.path.exists('shopping_data.db'):
        logging.error(f"Database file not found at {'shopping_data.db'}")
        return None
    conn.row_factory = sqlite3.Row
    return conn


@app.route('/page_register', methods=['GET', 'POST'])
def page_register():
    if request.method == 'POST':
        data = request.get_json()
       # 補齊空缺程式碼
        username = data.get('username') # 
        password = data.get('password') # 
        email = data.get('email') # 

        conn = get_db_connection() # 
        if conn is None: # 
            return jsonify({"status": "error", "message": "Database connection error"}), 500 # 
        
        try: 
            cursor = conn.cursor() # 
            cursor.execute("SELECT * FROM users WHERE username = ?", (username,)) # 
            existing_user = cursor.fetchone() # 
            if existing_user:  
                return jsonify({"status": "error", "message": "此名稱已被使用"})
            
            #密碼限制
            if not (len(password) >= 8 and not password.isdigit()):
                return jsonify({"status": "error", "message": "密碼必須超過8個字元且不能都是數字"})
            # 限制為 xxx@gmail.com
            if not re.match(r'[^@]+@gmail\.com$', email):
                return jsonify({"status": "error", "message": "Email 格式不符，必須為 XXX@gmail.com"}), 400 # 
            # 
            cursor.execute("INSERT INTO users (username, password, email) VALUES (?, ?, ?)", (username, password, email)) # 
            conn.commit() # 
            return jsonify({"status": "success", "message": "Registration successful"}), 201 # 
        
        except sqlite3.Error as e: # 
            logging.error(f"Database error in registration: {e}") # 
            return jsonify({"status": "error", "message": "An error occurred during registration"}), 500 # 
        finally: # 
            conn.close() # 
            
    return render_template('page_register.html')

def login_user(username, password):
    conn = get_db_connection()
    if conn is not None:
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE username = ? AND password = ?", (username, password))
            user = cursor.fetchone()
            if user:
                return {"status": "success", "message": "登入成功"}
            else:
                return {"status": "error", "message": "帳號或密碼輸入錯誤"}
        except sqlite3.Error as e:
            logging.error(f"Database query error: {e}")
            return {"status": "error", "message": "An error occurred"}
        finally:
            conn.close()
    else:
        return {"status": "error", "message": "Database connection error"}

@app.route('/page_login' , methods=['GET', 'POST'])
def page_login():
    try:
        if request.method == 'POST':
            data = request.get_json()
            username = data.get('username')
            password = data.get('password')
            result = login_user(username, password)
            if result["status"] == "success":
                session['username'] = username
            return jsonify(result)
        return render_template('page_login_.html')
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# 補齊剩餘副程式
@app.route('/') # 
@app.route('/shopping') # 
def page_shopping(): # 
    if 'username' not in session: # 
        flash('Please log in to access this page.', 'error') # 
        return redirect(url_for('page_login')) # 
    return render_template('index.html') # 

@app.route('/logout') # 
def page_logout(): # 
    session.pop('username', None) # 
    flash('You have been logged out.', 'success') # 
    return redirect(url_for('page_login')) # 

@app.route('/place_order', methods=['POST']) # 
def place_order(): # 
    if 'username' not in session: # 
        return jsonify({"status": "error", "message": "User not logged in"}), 401 # 

    data = request.get_json() # 
    order_items = data.get('orderItems') # 

    if not order_items: # 
        return jsonify({"status": "error", "message": "No items in order"}), 400 # 

    conn = get_db_connection() # 
    if conn is None: # 
        return jsonify({"status": "error", "message": "Database connection error"}), 500 # 

    try: # 
        cursor = conn.cursor() # 
        now = datetime.now() # 
        current_date = now.strftime("%Y-%m-%d") # 
        current_time = now.strftime("%H:%M:%S") # 

        for item in order_items: # 
            cursor.execute( # 
                '''INSERT INTO shop_list_table (Product, Price, Number, "Total Price", Date, Time) 
                   VALUES (?, ?, ?, ?, ?, ?)''', # 
                (item['name'], item['price'], item['qty'], item['total'], current_date, current_time) # 
            ) # 
        
        conn.commit() # 
        return jsonify({"status": "success", "message": "Order placed successfully"}), 201 # 

    except sqlite3.Error as e: # 
        conn.rollback() # 
        logging.error(f"Database error placing order: {e}") # 
        return jsonify({"status": "error", "message": "An error occurred placing the order"}), 500 # 
    finally: # 
        conn.close() # 

# 補齊空缺程式碼
if __name__ == '__main__': # 
    logging.basicConfig(level=logging.INFO) # 
    app.run(debug=True) # 

