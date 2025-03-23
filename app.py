from flask import Flask, render_template, request, redirect, flash, session, make_response, url_for, jsonify
import dbhelper, os

from dbhelper import get_student_by_username, update_student_profile, is_idno_exists, get_reservation_by_id_or_student, get_all_student_emails, delete_announcement, getprocess, get_all_registered_students, count_all_registered_students, get_admin_student_reservations,get_weekly_enrollment, get_monthly_enrollment, get_yearly_enrollment, count_all_reservations,search_student,get_reserved_students, get_enrolled_students,get_registered_students, count_registered_students, abort
from werkzeug.utils import secure_filename
from PIL import Image  
from flask import abort

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


app = Flask(__name__)
app.secret_key = "deluna"


# SMTP CONFIGURATION
SMTP_SERVER = "smtp.gmail.com" 
SMTP_PORT = 587
EMAIL_ADDRESS = "deluna.alexa494@gmail.com"  
EMAIL_PASSWORD = "xofo wvge gyaj imou" 

# PATH FOR UPLOADING PROFILE PICTURE
UPLOAD_FOLDER = "static/uploads"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# ALLOWED FILE EXTENSIONS
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# DISABLE CACHE
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


# LOGIN ROUTE - TO CHECK IF THE USER IS AN ADMIN OR A STUDENT
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        user = dbhelper.get_username(username)

        if user and user[0]["password"] == password:
            session["user"] = username
            session["idno"] = user[0]["idno"]
            session["logged_in"] = True
            session["role"] = "admin" if dbhelper.is_admin(username) else "student"

            # REDIRECT ADMIN TO ADMIN DASHBOARD 
            if session["role"] == "admin":
                flash("Admin login successful!", "success")
                return redirect("/admin_dashboard")

            # REDIRECT STUDENTS TO STUDENTS DASHBOARD 
            flash("Login successful!", "success")
            return redirect("/student_dashboard")

        flash("Invalid username or password.", "danger")

    return render_template("login.html")

# FORGOT PASSWORD - SEND EMAIL TO RESET PASSWORD
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


# REGISTRATION ROUTE - REGISTRATION FOR A NEW STUDENT
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

        # VALIDATE IF ID NUMBER ALREADY EXISTS
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

# ADD ANNOUNCEMENTS 
@app.route("/add_announcement", methods=["POST"])
def add_announcement():
    if "user" not in session or not dbhelper.is_admin(session["user"]):
        flash("Unauthorized access!", "danger")
        return redirect("/login")

    data = request.get_json() 
    title = data.get("title")
    content = data.get("content")
    email_subject = data.get("emailSubject", title)  
    email_users_value = data.get("emailUsers") 
    email_users = email_users_value is not None

    if not title or not content:
        flash("Title and content are required!", "danger")
        return jsonify({"success": False})

    print(f"Adding announcement: {title} - {content}")  
    success = dbhelper.add_announcement(title, content) 

    if success:
        print("Announcement saved successfully!")  
        flash("Announcement added successfully!", "success")

        if email_users:
            send_email(email_subject, content)

        return jsonify({"success": True})
    else:
        print("Failed to save announcement!")  
        flash("Failed to add announcement.", "danger")
        return jsonify({"success": False})


# GET ANNOUNCEMENTS
@app.route("/get_announcements", methods=["GET"])
def get_announcements():
    if "user" not in session:
        return jsonify({"error": "Unauthorized"}), 403

    page = int(request.args.get("page", 1)) 
    search_query = request.args.get("search", "").strip().lower()

    page_size = 5
    offset = (page - 1) * page_size

    try:
        sql = """
            SELECT id, title, content, date_posted
            FROM announcements
            WHERE LOWER(title) LIKE ?
            ORDER BY date_posted DESC
            LIMIT ? OFFSET ?
        """
        search_pattern = f"%{search_query}%"  
        announcements = dbhelper.getprocess(sql, (search_pattern, page_size, offset))

        count_sql = """
            SELECT COUNT(*)
            FROM announcements
            WHERE LOWER(title) LIKE ?
        """
        total_entries = dbhelper.getprocess(count_sql, (search_pattern,))[0]["COUNT(*)"]

        total_pages = max(1, (total_entries + page_size - 1) // page_size)  

        return jsonify({
            "current_page": page,
            "total_pages": total_pages,
            "total_entries": total_entries,
            "data": announcements
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


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

    announcements = dbhelper.get_announcements()  

    return render_template("student_dashboard.html", student=student_info, announcements=announcements)


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
        return redirect("/student_login")

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

        if not all([purpose, lab, time_in, date]):  
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
        return redirect("/student_login")

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

    total_pages = (total_reservations + per_page - 1) // per_page  

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



# FUNCTION TO SEND EMAIL TO ALL REGISTERED STUDENTS
def send_email(subject, content):
    recipients = get_all_student_emails()  # Fetch student emails from the database

    if not recipients:  # If no students are registered, don't send email
        print("No registered student emails found.")
        return

    print(f"📧 Sending email to: {recipients}")  # Debugging - See recipient list

    msg = MIMEText(content)
    msg["Subject"] = subject
    msg["From"] = EMAIL_ADDRESS
    msg["To"] = ", ".join(recipients)  # Only for display, not for sending

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            # 🔹 `recipients` should be a list, not a string
            server.sendmail(EMAIL_ADDRESS, recipients, msg.as_string())  
        print("✅ Email sent successfully!")
    except Exception as e:
        print("⚠️ Error sending email:", e)


# =============== ADMIN AREA ===================== ADMIN AREA ======================= ADMIN AREA ============= ADMIN AREA ===============

# ADMIN DASHBOARD
@app.route("/admin_dashboard")
def admin_dashboard():
    if "user" not in session or not dbhelper.is_admin(session["user"]):
        return redirect("/login")
    
    announcements = dbhelper.get_announcements() 
    return render_template("admin_dashboard.html", announcements=announcements)

# ADMIN STUDENTS
@app.route("/admin_students")
def admin_students():
    if "user" not in session or not dbhelper.is_admin(session["user"]):
        return redirect("/login")
    
    page = request.args.get('page', 1, type=int)  # Default to page 1 if not specified
    per_page = 10
    search_query = request.args.get('search', '', type=str)  # Default search query is empty

    # If there's no search query, return all students
    if not search_query:
        students = dbhelper.get_enrolled_students(page, per_page)
    else:
        # If there is a search query, apply it
        students = dbhelper.get_enrolled_students(page, per_page, search_query)

    # Filter out admin user
    def filter_admin(users):
        return [user for user in users if str(user['idno']) != '428237351']  # Filter out admin

    students = filter_admin(students)

    # Count the total number of students after excluding admin
    total_students = dbhelper.count_all_registered_students()

    # Calculate total pages for pagination
    total_pages = (total_students + per_page - 1) // per_page

    # Calculate the start and end range for the current page
    start = (page - 1) * per_page + 1
    end = min(page * per_page, total_students)

    return render_template("admin_students.html", 
                           students=students, 
                           total_students=total_students, 
                           page=page, 
                           per_page=per_page, 
                           total_pages=total_pages,
                           start=start, 
                           end=end,
                           search_query=search_query)







# DELETE ANNOUNCEMENT
@app.route('/delete-announcement/<int:announcement_id>', methods=['POST'])
def delete_announcement(announcement_id):
    try:
        success = dbhelper.delete_announcement(announcement_id)
        if success:
            return jsonify({'success': True})
        else:
            return jsonify({'success': False, 'message': 'Failed to delete the announcement.'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

# EDIT ANNOUNCEMENT 
@app.route('/edit-announcement/<int:announcement_id>', methods=['POST'])
def edit_announcement(announcement_id):
    try:
        data = request.get_json()  
        new_content = data.get('content')

        if not new_content:
            return jsonify({'success': False, 'message': 'Content cannot be empty.'})

        success = dbhelper.update_announcement(announcement_id, new_content)

        if success:
            return jsonify({'success': True})
        else:
            return jsonify({'success': False, 'message': 'Failed to update the announcement.'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

@app.route("/search_reserved_students", methods=["GET"])
def search_reserved_students():
    query = request.args.get('query', '').strip().lower()

    if not query:  
        return jsonify({"students": []})

    
    students = dbhelper.get_reserved_students(query)

    if not students: 
        return jsonify({"students": []})

    return jsonify({"students": students})  


# ACCEPT RESERVATION
@app.route("/accept_reservation", methods=["POST"])
def accept_reservation():
    id_number = request.form.get("idNumber")
    reservation = dbhelper.get_reservation_by_id(id_number)
    if not reservation:
        return jsonify({"error": "Reservation not found"}), 404

    if reservation['status'] == "Accepted":
        return jsonify({"message": "Reservation already accepted."}), 400
    
    dbhelper.update_reservation_status(id_number, "Accepted")
    return jsonify({"message": "Reservation accepted successfully!"})

# REJECT RESERVATION
@app.route("/reject_reservation", methods=["POST"])
def reject_reservation():
    id_number = request.form.get("idNumber")
    reservation = dbhelper.get_reservation_by_id(id_number)
    if not reservation:
        return jsonify({"error": "Reservation not found"}), 404

    if reservation['status'] == "Rejected":
        return jsonify({"message": "Reservation already rejected."}), 400
    
    dbhelper.update_reservation_status(id_number, "Rejected")
    return jsonify({"message": "Reservation rejected successfully!"})



# ADMIN SIT-IN PAGE
@app.route("/admin_sit_in")
def admin_sit_in():
    if "user" not in session or not dbhelper.is_admin(session["user"]):
        flash("Please log in as an admin.", "warning")
        return redirect("/login")

    page = request.args.get("page", 1, type=int)
    per_page = 10
    offset = (page - 1) * per_page

    reservations = dbhelper.get_all_reservations_paginated(per_page, offset)
    total_reservations = dbhelper.count_all_reservations()

    total_pages = (total_reservations + per_page - 1) // per_page  

    return render_template(
        "admin_sit_in.html",
        reservations=reservations,
        page=page,
        total_pages=total_pages
    )

# ADMIN REPORTS
@app.route('/api/enrollment-data')
def enrollment_data():
    weekly_data = get_weekly_enrollment()
    monthly_data = get_monthly_enrollment()
    yearly_data = get_yearly_enrollment()

    print("Weekly Data:", weekly_data)
    print("Monthly Data:", monthly_data)
    print("Yearly Data:", yearly_data)

    formatted_data = {
        'weekly': [entry['count'] for entry in weekly_data],
        'monthly': [entry['count'] for entry in monthly_data],
        'yearly': [entry['count'] for entry in yearly_data]
    }

    return jsonify(formatted_data)

# TOTAL STUDENTS
@app.route('/api/total-students')
def total_students():
    total = count_all_registered_students()
    return jsonify({"total_students": total})

# TOTAL SIT-IN REQUESTS
@app.route("/api/total_reservations", methods=["GET"])
def get_total_reservations():
    try:
        total_reservations = dbhelper.count_all_reservations()
        print("Total Reservations:", total_reservations) 
        return jsonify({"total_reservations": total_reservations})
    except Exception as e:
        print("Error fetching total reservations:", str(e))
        return jsonify({"error": "Failed to fetch total reservations"}), 500
    






@app.route('/admin_enrolled_students', methods=['GET'])
def admin_enrolled_students():
    page = request.args.get('page', 1, type=int)
    per_page = 10
    search_query = request.args.get('search', '', type=str)

    students = get_enrolled_students(page, per_page, search_query)

    total_students = count_all_registered_students()
    
    return render_template('admin_enrolled_students.html', students=students, total_students=total_students)






# SEARCH REGISTERED STUDENTS 
@app.route("/search_registered_students", methods=["GET"])
def search_registered_students():
    query = request.args.get('query', '').strip().lower()
    page = request.args.get('page', 1, type=int) 
    per_page = 10  
    offset = (page - 1) * per_page  

    if not query:  
        students = get_all_registered_students(limit=per_page, offset=offset)
        total_students = count_all_registered_students() 
    else:  
        students = get_registered_students(query, limit=per_page, offset=offset)
        total_students = count_registered_students(query)  

    if not students:  
        return jsonify({"students": [], "total": 0, "page": page, "per_page": per_page})

    return jsonify({
        "students": students,
        "total": total_students,
        "page": page,
        "per_page": per_page
    })


if __name__ == "__main__":
    app.run(debug=True)



