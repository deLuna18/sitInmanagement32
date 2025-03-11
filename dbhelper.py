from sqlite3 import connect,Row
import datetime
import pytz

database:str = 'usermanagement.db'

# FETCH DATA FROM THE DATABASE
def getprocess(sql: str, params: tuple = ()) -> list:
    db = connect(database)
    cursor: object = db.cursor()
    cursor.row_factory = Row
    cursor.execute(sql, params)
    data: list = cursor.fetchall()
    db.close()
    return [dict(row) for row in data] 
    
# EXECUTE INSERT, UPDATE AND DELETE QUERIES
def postprocess(sql: str, params: tuple = ()) -> bool:
    db = connect(database)
    cursor: object = db.cursor()
    cursor.execute(sql, params)
    db.commit()
    db.close()
    return cursor.rowcount > 0

# CHECK IF IDNO ALREADY EXISTS
def is_idno_exists(idno: int) -> bool:
    sql = "SELECT idno FROM users WHERE idno = ?"
    result = getprocess(sql, (idno,))
    return len(result) > 0  

# CHECK IF USERNAME ALREADY EXISTS
def get_username(username: str) -> list:
    sql = "SELECT * FROM users WHERE username = ?"
    return getprocess(sql, (username,))

# GET ALL USERS FROM THE DATABASE
def get_all_users() -> list:
    sql = "SELECT * FROM users"
    return getprocess(sql)

# STUDENT REGISTRATION
def register_user(idno: int, lastname: str, firstname: str, middlename: str, 
                  course: str, year_level: str, email_address: str, 
                  username: str, password: str) -> bool:
    # CHECK IF IDNO OR USERNAME ALREADY EXISTS
    if is_idno_exists(idno) or get_username(username): 
        return False  
    
    # DEFAULT PROFILE PICTURE
    default_profile_picture = "profile_picture.png" 

    sql = """INSERT INTO users (idno, lastname, firstname, middlename, course, year_level, 
                                email_address, username, password, profile_picture) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"""
             
    return postprocess(sql, (idno, lastname, firstname, middlename, course, year_level, 
                             email_address, username, password, default_profile_picture))

# GET STUDENT DATA BY USERNAME
def get_student_by_username(username: str) -> dict:
    sql = """SELECT idno, lastname, firstname, middlename, course, year_level, 
                    email_address, username, password, profile_picture
             FROM users WHERE username = ?"""
    
    student_list = getprocess(sql, (username,))  

    if student_list:
        student = student_list[0] 
        student["profile_picture"] = student.get("profile_picture") or "profile_picture.png"
        return student  

    return None  

# UPDATE PROFILE PICTURE
def update_profile_picture(username: str, filename: str) -> bool:
    sql = "UPDATE users SET profile_picture = ? WHERE username = ?"
    return postprocess(sql, (filename, username))

# STUDENT UPDATE = EDIT STUDENT INFO
def update_student_profile(username: str, firstname: str, middlename: str, lastname: str, 
                           course: str, year_level: str, email_address: str, profile_picture: str) -> bool:
    print(f"Updating user: {username}")
    sql = """UPDATE users SET 
                firstname = ?, 
                middlename = ?, 
                lastname = ?, 
                course = ?, 
                year_level = ?, 
                email_address = ?, 
                profile_picture = ? 
            WHERE username = ?"""
    
    return postprocess(sql, (firstname, middlename, lastname, course, year_level, 
                             email_address, profile_picture, username))


# CREATE A STUDENT RESERVATION
def create_reservation(idno: int, student_name: str, course: str, year_level: str, 
                       purpose: str, lab: str, time_in: str, date: str) -> bool:
    sql = """INSERT INTO reservations (idno, student_name, course, year_level, 
                                       purpose, lab, time_in, date) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)"""
    return postprocess(sql, (idno, student_name, course, year_level, purpose, lab, time_in, date))


# GET STUDENT HISTORY RESERVATION
def get_student_reservations_paginated(idno: int, per_page: int, offset: int) -> list:
    sql = """SELECT idno, student_name, course, year_level, purpose, lab, time_in, date 
             FROM reservations 
             WHERE idno = ? 
             ORDER BY date DESC 
             LIMIT ? OFFSET ?"""
    return getprocess(sql, (idno, per_page, offset))

# COUNT FOR PAGINATION
def count_student_reservations(idno: int) -> int:
    sql = "SELECT COUNT(*) AS total FROM reservations WHERE idno = ?"
    result = getprocess(sql, (idno,))
    
    if result:  
        return result[0]["total"] if isinstance(result[0], dict) else result[0][0]  
    return 0

# CHECK IF USER IS ADMIN
def is_admin(username: str) -> bool:
    sql = "SELECT is_admin FROM users WHERE username = ?"
    result = getprocess(sql, (username,))
    return result[0]["is_admin"] == 1 if result else False

# GET ALL REGISTERED STUDENT EMAILS
def get_all_student_emails() -> list:
    sql = "SELECT email_address FROM users"
    student_emails = getprocess(sql)
    
    return [student["email_address"] for student in student_emails if student["email_address"]]

# ANNOUNCEMENTS 
def add_announcement(title: str, content: str) -> bool:
    # Set timezone to Philippine Time (Asia/Manila)
    local_timezone = pytz.timezone("Asia/Manila")
    date_posted = datetime.datetime.now(local_timezone).strftime('%Y-%m-%d %H:%M:%S')

    sql = "INSERT INTO announcements (title, content, date_posted) VALUES (?, ?, ?)"
    return postprocess(sql, (title, content, date_posted))

# GET ANNOUNCEMENT 
def get_announcements() -> list:
    sql = "SELECT id, title, content, date_posted FROM announcements ORDER BY date_posted DESC, id DESC"
    return getprocess(sql)

# DELETE ANNOUNCEMENT
def delete_announcement(announcement_id: int) -> bool:
    sql = "DELETE FROM announcements WHERE id = ?"
    return postprocess(sql, (announcement_id,))

# EDIT ANNOUNCEMENT 
def update_announcement(announcement_id: int, new_content: str) -> bool:
    sql = "UPDATE announcements SET content = ? WHERE id = ?"
    return postprocess(sql, (new_content, announcement_id))