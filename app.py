from flask import Flask, render_template, request, redirect, flash, session, make_response, url_for, jsonify
import dbhelper, os
from dbhelper import get_student_by_username, update_student_profile, is_idno_exists, count_student_reservations
from werkzeug.utils import secure_filename
from PIL import Image  


import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


app = Flask(__name__)
app.secret_key = "deluna"

SMTP_SERVER = "smtp.gmail.com" 
SMTP_PORT = 587
EMAIL_ADDRESS = "deluna.alexa494@gmail.com"  
EMAIL_PASSWORD = "xofo wvge gyaj imou" 

UPLOAD_FOLDER = "static/uploads"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@app.after_request
def disable_cache(response):
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response


# =============== STUDENT AREA ===================== STUDENT AREA ======================= STUDENT AREA ============= STUDENT AREA ===============

# CHECK IF THE USER IS AN ADMIN OR A STUDENT
@app.route("/")
def home():
    if "user" in session:
        if dbhelper.is_admin(session["user"]):  
            return redirect("/admin_dashboard")
        return redirect("/student_dashboard")
    return redirect("/login")


# LOGIN FOR STUDENT AND ADMIN
@app.route("/login", methods=["GET", "POST"])
def login():
    username_cookie = request.cookies.get("username")
    if username_cookie:
        session["user"] = username_cookie
        session["role"] = "admin" if dbhelper.is_admin(username_cookie) else "student"  # Store role

        if session["role"] == "admin":
            return redirect("/admin_dashboard")
        return redirect("/student_dashboard")

    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        remember_me = request.form.get("remember_me")

        user = dbhelper.get_username(username)

        if user and user[0]["password"] == password:
            session["user"] = username
            session["idno"] = user[0]["idno"]
            session["logged_in"] = True
            session["role"] = "admin" if dbhelper.is_admin(username) else "student"  # Store role

            # REDIRECT ADMIN TO ADMIN DASHBOARD 
            if session["role"] == "admin":
                flash("Admin login successful!", "success")
                return redirect("/admin_dashboard")

            # REDIRECT STUDENTS TO STUDENTS DASHBOARD 
            flash("Login successful!", "success")
            if remember_me:
                resp = make_response(redirect("/student_dashboard"))
                resp.set_cookie("username", username, max_age=30*24*60*60, path='/')  # 30 days
                return resp

            return redirect("/student_dashboard")

        flash("Invalid username or password.", "danger")

    return render_template("login.html")

# FORGOT PASSWORD
@app.route('/forgot-password', methods=['POST'])
def forgot_password():
    email = request.form.get('email')

    if not email:
        flash('Please enter a valid email address.', 'danger')
        return redirect(url_for('login', forgot_password=True))

    msg = MIMEMultipart()
    msg["From"] = EMAIL_ADDRESS
    msg["To"] = email
    msg["Subject"] = "Password Reset Request"

    body = f"""
    Hi,

    You requested a password reset. Click the link below to reset your password:

    http://yourwebsite.com/reset-password?email={email}

    If you did not request this, please ignore this email.

    Regards,
    Your Team
    """
    msg.attach(MIMEText(body, "plain"))

    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()  
        server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        server.sendmail(EMAIL_ADDRESS, email, msg.as_string())
        server.quit()

        flash('A password reset link has been sent to your email.', 'success')
    except Exception as e:
        flash(f'Error sending email: {str(e)}', 'danger')

    return redirect(url_for('login', forgot_password=True))


# REGISTRATION
@app.route("/student_register", methods=["GET", "POST"])
def student_register():
    if request.method == "POST":
        idno = request.form["idno"]
        lastname = request.form["lastname"]
        firstname = request.form["firstname"]
        middlename = request.form["middlename"]
        course = request.form["course"]
        year_level = request.form["year_level"]
        email_address = request.form["email_address"]
        username = request.form["username"]
        password = request.form["password"]  

        # Validate if idno already exists
        if is_idno_exists(idno):
            flash("ID Number already exists. Please use a different ID number.", "danger")
            return redirect("/student_register")

        success = dbhelper.register_user(idno, lastname, firstname, middlename, course, 
                                         year_level, email_address, username, password)

        if success:
            flash("Registration successful! Please login.", "success")
            return redirect("/login")
        else:
            flash("Username already exists. Please try again with a different username.", "danger")

    return render_template("student_register.html")




# STUDENT DASHBOARD
@app.route("/student_dashboard")
def student_dashboard():
    if "user" not in session:
        flash("Please log in first.", "warning")
        return redirect("/login")

    student_info = dbhelper.get_student_by_username(session["user"])

    if not student_info:
        flash("User not found!", "danger")
        return redirect("/login")

    session["student_info"] = student_info  
    return render_template("student_dashboard.html", student=student_info)

# UPLOAD PROFILE PICTURE
@app.route("/upload_profile_picture", methods=["POST"])
def upload_profile_picture():
    if "user" not in session:
        return jsonify({"success": False, "message": "Please log in first."}), 403

    if "file" not in request.files:
        return jsonify({"success": False, "message": "No file selected."})

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"success": False, "message": "No selected file."})

    if file and allowed_file(file.filename):
        if file.content_length > 2 * 1024 * 1024:  
            return jsonify({"success": False, "message": "File size exceeds 2MB limit."})

        filename = secure_filename(f"{session['user']}_{file.filename}")
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)

        image = Image.open(file)
        image.thumbnail((300, 300)) 
        image.save(file_path)

        dbhelper.update_profile_picture(session["user"], filename)

        session['student_info']['profile_picture'] = filename

        return jsonify({"success": True, "message": "Profile picture updated!", "image_filename": filename})

    return jsonify({"success": False, "message": "Invalid file type. Allowed: png, jpg, jpeg, gif"})

# EDIT PROFILE
@app.route('/edit_profile', methods=['GET', 'POST'])
def edit_profile():
    username = session.get('user')  
    if not username:
        flash("Please log in first.", "warning")
        return redirect(url_for('login'))  

    student = get_student_by_username(username)
    if not student:
        flash("User not found!", "danger")
        return redirect(url_for('login'))

    if request.method == 'POST':
        firstname = request.form.get('firstname', '')
        lastname = request.form.get('lastname', '')
        middlename = request.form.get('middlename', '')  
        course = request.form.get('course', '')
        year_level = request.form.get('year_level', '')
        email_address = request.form.get('email_address', '')
        
        profile_picture = student.get("profile_picture", "def.png")  

        # PROFILE IMAGAE UPLOAD
        if 'profile_image' in request.files:
            file = request.files['profile_image']
            if file and file.filename:  # CHECK FILE IF IT EXISTS
                if file.content_length > 5 * 1024 * 1024:  
                    flash("File size exceeds 5MB limit.", "danger")
                    return redirect(url_for('edit_profile'))

                if allowed_file(file.filename):
                    filename = secure_filename(f"{username}_{file.filename}")
                    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)

                    try:
                        image = Image.open(file)
                        image.thumbnail((300, 300))
                        image.save(file_path)
                        profile_picture = filename  # SET NEW PROFILE PIC
                    except Exception as e:
                        flash(f"Error processing image: {str(e)}", "danger")
                        return redirect(url_for('edit_profile'))

        # UPDATE STUDENT PROFILE IN THE DATABASEEE
        success = update_student_profile(username, firstname, middlename, lastname, course, 
                                         year_level, email_address, profile_picture)
        print("Profile update success:", success)  

        if success:
            # RELOAD
            session["student_info"] = get_student_by_username(username)
            flash('Profile updated successfully!', 'success')
            return redirect(url_for('edit_profile'))
        else:
            flash('Failed to update profile. Check database connection!', 'danger')

    return render_template('edit_profile.html', student=student)


# SAVE EDIT_PROFILE
@app.route('/save_profile', methods=['POST'])
def save_profile():
    username = session.get('user')
    if not username:
        return {"success": False, "message": "Please log in first."}, 403 

    student = get_student_by_username(username)  
    if not student:
        return {"success": False, "message": "User not found."}, 404

    firstname = request.form.get('firstname')
    middlename = request.form.get('middlename')
    lastname = request.form.get('lastname')
    course = request.form.get('course')
    year_level = request.form.get('year_level')
    email_address = request.form.get('email_address')

    profile_picture = student.get("profile_picture", "profile_picture.png")
    if 'profile_image' in request.files:
        file = request.files['profile_image']
        if file and file.filename:
            filename = secure_filename(f"{username}_{file.filename}")
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            profile_picture = filename  

    success = update_student_profile(username, firstname, middlename, lastname, course, 
                                     year_level, email_address, profile_picture)

    if success:
        session["student_info"] = get_student_by_username(username)

        return {"success": True, "message": "Profile saved successfully!"}

    return {"success": False, "message": "Failed to save profile."}, 500


# STUDENT RESERVATION
@app.route("/student_reservation", methods=["GET", "POST"])
def student_reservation():
    if "user" not in session:
        flash("Please log in first.", "warning")
        return redirect("/login")

    student = dbhelper.get_student_by_username(session["user"])

    if not student:
        flash("User not found!", "danger")
        return redirect("/student_dashboard")

    idno = student.get("idno")  
    student_name = f"{student.get('firstname')} {student.get('lastname')}"  # Full name
    course = student.get("course")
    year_level = student.get("year_level")

    if request.method == "POST":
        purpose = request.form.get("purpose")
        lab = request.form.get("lab")
        time_in = request.form.get("time_in")
        date = request.form.get("date")

        if not all([purpose, lab, time_in, date]):  # Ensure all fields are filled
            flash("Please fill out all fields.", "warning")
            return redirect("/student_reservation")

        success = dbhelper.create_reservation(idno, student_name, course, year_level, purpose, lab, time_in, date)

        if success:
            flash("Reservation successfully submitted!", "success")
            return redirect("/student_dashboard")
        else:
            flash("Failed to submit reservation.", "danger")

    return render_template("student_reservation.html", student=student)


# HISTORY FOR STUDENT RESERVATION
@app.route("/student_history")
def student_history():
    if "user" not in session:
        flash("Please log in first.", "warning")
        return redirect("/login")

    student = dbhelper.get_student_by_username(session["user"])
    if not student:
        flash("User not found!", "danger")
        return redirect("/student_dashboard")

    idno = student.get("idno")

    # Get page number from request, default to 1
    page = request.args.get("page", 1, type=int)
    per_page = 10  # Set items per page
    offset = (page - 1) * per_page

    reservations = dbhelper.get_student_reservations_paginated(idno, per_page, offset)
    total_reservations = dbhelper.count_student_reservations(idno)

    total_pages = (total_reservations + per_page - 1) // per_page  # Calculate total pages

    return render_template(
        "student_history_reservation.html",
        reservations=reservations,
        page=page,
        total_pages=total_pages
    )


# LOGOUT FOR STUDENTS AND ADMIN
@app.route("/logout")
def logout():
    session.clear()  # Clears all session data
    resp = make_response(redirect("/login"))  # Default redirect to student login
    resp.delete_cookie("username")  # Remove stored username

    # Check if the user is an admin
    if session.get("role") == "admin":  
        resp = make_response(redirect("/admin_login"))  # Redirect admins to the admin login page

    flash("You have been logged out.", "success")
    return resp




# =============== ADMIN AREA ===================== ADMIN AREA ======================= ADMIN AREA ============= ADMIN AREA ===============

# ADMIN DASHBOARD
@app.route("/admin_dashboard")
def admin_dashboard():
    if "user" not in session or not dbhelper.is_admin(session["user"]):
        return redirect("/login")
    return render_template("admin_dashboard.html")


if __name__ == "__main__":
    app.run(debug=True)
