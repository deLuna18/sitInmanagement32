from sqlite3 import connect,Row
import datetime, pytz

from datetime import datetime, timedelta

from flask import abort


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

    # SET REGISTRATION DATE (PHILIPPINE TIME)
    philippine_offset = timedelta(hours=8)  # UTC+8 for Philippine Time
    registration_date = (datetime.utcnow() + philippine_offset).strftime('%Y-%m-%d %H:%M:%S')

    sql = """INSERT INTO users (idno, lastname, firstname, middlename, course, year_level, 
                                email_address, username, password, profile_picture, registration_date) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"""
             
    return postprocess(sql, (idno, lastname, firstname, middlename, course, year_level, 
                             email_address, username, password, default_profile_picture, registration_date))

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

# UPDATE PROFILE PICTURE (STUDENT DASHBOARD)
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

# CREATE AND DISPLAY STUDENT RESERVATION (STUDENT RESERVATION & STUDENT HISTORY INFORMATION) 
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

# GET STUDENT RESERVATION (ADMIN (STUDENT RESERVATION) VIEW)
def get_admin_student_reservations(idno: int, per_page: int, offset: int) -> list:
    sql = """SELECT idno, student_name, course, year_level, purpose, lab, time_in, date, status, remaining_sessions
            FROM reservations 
            WHERE idno = ? 
            ORDER BY date DESC 
            LIMIT ? OFFSET ?"""
    return getprocess(sql, (idno, per_page, offset))



# GET ALL RESERVATIONS FOR ADMIN VIEW
def get_all_reservations_paginated(per_page: int, offset: int) -> list:
    sql = """SELECT idno, student_name, course, year_level, purpose, lab, time_in, date 
             FROM reservations 
             ORDER BY date DESC 
             LIMIT ? OFFSET ?"""
    return getprocess(sql, (per_page, offset))

# COUNT TOTAL RESERVATIONS
def count_all_reservations() -> int:
    sql = "SELECT COUNT(*) AS total FROM reservations"
    result = getprocess(sql)
    
    if result:  
        return result[0]["total"] if isinstance(result[0], dict) else result[0][0]  
    return 0

def count_student_reservations(idno: int) -> int:
    sql = "SELECT COUNT(*) AS total FROM reservations WHERE idno = ?"
    result = getprocess(sql, (idno,))
    
    if result:  
        return result[0]["total"] if isinstance(result[0], dict) else result[0][0]  
    return 0

# # COUNT FOR PAGINATION
# def count_student_reservations(idno: int) -> int:
#     sql = "SELECT COUNT(*) AS total FROM reservations WHERE idno = ?"
#     result = getprocess(sql, (idno,))
    
#     if result:  
#         return result[0]["total"] if isinstance(result[0], dict) else result[0][0]  
#     return 0

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
    date_posted = datetime.now(local_timezone).strftime('%Y-%m-%d %H:%M:%S')

    sql = "INSERT INTO announcements (title, content, date_posted) VALUES (?, ?, ?)"
    result = postprocess(sql, (title, content, date_posted))
    print(f"Announcement inserted: {result}")
    return result


# GET ANNOUNCEMENT 
def get_announcements() -> list:
    sql = "SELECT id, title, content, date_posted FROM announcements ORDER BY date_posted DESC, id DESC"
    announcements = getprocess(sql)
    print(f"Fetched announcements: {announcements}")
    return announcements

# DELETE ANNOUNCEMENT
def delete_announcement(announcement_id: int) -> bool:
    sql = "DELETE FROM announcements WHERE id = ?"
    return postprocess(sql, (announcement_id,))

# EDIT ANNOUNCEMENT 
def update_announcement(announcement_id: int, new_content: str) -> bool:
    sql = "UPDATE announcements SET content = ? WHERE id = ?"
    return postprocess(sql, (new_content, announcement_id))





def get_reservation_by_id_or_student(search_value):
    query = """
    SELECT idno, student_name, purpose, lab, remaining_sessions
    FROM reservations
    WHERE idno = ? OR student_name LIKE ?
    """
    result = getprocess(query, (search_value, f"%{search_value}%"))
    print("Database Result:", result)
    return result if result else []




# GET RESERVATION BY ID
def get_reservation_by_id(id_number: str) -> dict:
    sql = "SELECT * FROM reservations WHERE idno = ?"
    result = getprocess(sql, (id_number,))
    return result[0] if result else {}

# UPDATE RESERVATION STATUS
def update_reservation_status(id_number: str, status: str) -> None:
    remaining_sessions = 30 if status == "Accepted" else 0
    sql = "UPDATE reservations SET status = ?, remaining_sessions = ? WHERE idno = ?"
    rows_affected = postprocess(sql, (status, remaining_sessions, id_number))
    if rows_affected == 0:
        print(f"No reservation updated for ID {id_number}.")





def get_all_registered_students(limit=10, offset=0):
    sql = """
    SELECT idno, firstname, lastname, course, year_level, email_address, username
    FROM users
    LIMIT ? OFFSET ?
    """
    return getprocess(sql, (limit, offset))


def count_all_registered_students():
    sql = "SELECT COUNT(*) AS total FROM users"
    result = getprocess(sql)
    return result[0]["total"] if result else 0




def count_all_reservations():
    sql = "SELECT COUNT(*) AS total FROM reservations"
    result = getprocess(sql)
    print("Query Result:", result) 
    return result[0]["total"] if result else 0






def get_students_with_reservations(query: str) -> list:
    # Assuming you have a reservations table that links students to their reservations
    sql = """
        SELECT s.idno, s.firstname, s.lastname
        FROM students s
        JOIN reservations r ON s.idno = r.student_id
        WHERE LOWER(s.firstname) LIKE ? OR LOWER(s.lastname) LIKE ?
    """
    search_pattern = f"%{query}%"
    return getprocess(sql, (search_pattern, search_pattern))




# THIS IS FOR ADMIN REPORTS - DASHBOARD
def get_weekly_enrollment():
    sql = """
    SELECT strftime('%W', registration_date) AS week, COUNT(*) AS count
    FROM users
    WHERE registration_date IS NOT NULL
    GROUP BY week
    ORDER BY week
    """
    return getprocess(sql)

def get_monthly_enrollment():
    sql = """
    SELECT strftime('%m', registration_date) AS month, COUNT(*) AS count
    FROM users
    WHERE registration_date IS NOT NULL
    GROUP BY month
    ORDER BY month
    """
    return getprocess(sql)

def get_yearly_enrollment():
    sql = """
    SELECT strftime('%Y', registration_date) AS year, COUNT(*) AS count
    FROM users
    WHERE registration_date IS NOT NULL
    GROUP BY year
    ORDER BY year
    """
    return getprocess(sql)







# Fetch enrolled students based on search query, pagination
def get_enrolled_students(page, per_page, search_query=''):
    # Check if the search query is a number (search by idno)
    if search_query.isdigit():
        sql = '''
            SELECT idno, firstname, lastname, course, year_level, email_address, username
            FROM users
            WHERE idno = ?  -- Exact match for idno
            LIMIT ? OFFSET ?
        '''
        params = (search_query, per_page, (page - 1) * per_page)
    else:
        # If the search is a string, search by firstname, lastname, or email_address using LIKE
        search_term = f"%{search_query}%"
        sql = '''
            SELECT idno, firstname, lastname, course, year_level, email_address, username
            FROM users
            WHERE firstname LIKE ? OR lastname LIKE ? OR email_address LIKE ?
            LIMIT ? OFFSET ?
        '''
        params = (search_term, search_term, search_term, per_page, (page - 1) * per_page)

    # Execute the query with the parameters
    return getprocess(sql, params)


# Fetch reserved students based on search query
def get_reserved_students(search_query=''):
    sql = '''
        SELECT idno, student_name, course, year_level, purpose, lab, status
        FROM reservations
        WHERE student_name LIKE ? 
           OR course LIKE ? 
           OR year_level LIKE ?
           OR idno LIKE ?  -- Adding search by `idno`
    '''
    search_term = f"%{search_query}%"
    params = (search_term, search_term, search_term, search_term)  # Added idno as the fourth search term
    return getprocess(sql, params)

# Search for students based on query (e.g., name, email, or ID)
def search_student(query: str) -> list:
    sql = '''
        SELECT idno, firstname, lastname, course, year_level, email_address, username
        FROM users
        WHERE firstname LIKE ? OR lastname LIKE ? OR idno LIKE ? OR email_address LIKE ?
    '''
    search_term = f"%{query}%"
    return getprocess(sql, (search_term, search_term, search_term, search_term))











def count_registered_students(search_query=''):
    sql = '''
        SELECT COUNT(*) AS total
        FROM users
        WHERE (idno LIKE ?  -- Search by ID number
           OR firstname LIKE ?  -- Search by first name
           OR lastname LIKE ?)  -- Search by last name
           AND idno != ?  -- Exclude admin user
    '''
    search_term = f"%{search_query}%"
    admin_id = "428237351"  # Admin's ID
    params = (search_term, search_term, search_term, admin_id)
    result = getprocess(sql, params)
    return result[0]["total"] if result else 0

def count_all_registered_students():
    sql = """
    SELECT COUNT(*) AS total
    FROM users
    WHERE idno != ?  -- Exclude admin user
    """
    admin_id = "428237351"  # Admin's ID
    result = getprocess(sql, (admin_id,))
    return result[0]["total"] if result else 0


# GET ALL REGISTERED STUDENTS WITH PAGINATION
# GET ALL REGISTERED STUDENTS WITH PAGINATION
def get_all_registered_students(limit=10, offset=0):
    sql = """
    SELECT idno, firstname, middlename, lastname, course, year_level, email_address, username, profile_picture
    FROM users
    WHERE idno != ?  
    ORDER BY idno ASC
    LIMIT ? OFFSET ?
    """
    admin_id = "428237351"  
    return getprocess(sql, (admin_id, limit, offset))



# GET REGISTERED STUDENTS
def get_registered_students(search_query='', limit=10, offset=0):
    sql = '''
        SELECT idno, firstname, lastname, course, year_level, email_address, username
        FROM users
        WHERE (idno LIKE ?  -- Search by ID number
           OR firstname LIKE ?  -- Search by first name
           OR lastname LIKE ?)  -- Search by last name
           AND idno != ?  -- Exclude admin user
        ORDER BY idno ASC  -- Sort by idno in ascending order
        LIMIT ? OFFSET ?  -- Add pagination
    '''
    search_term = f"%{search_query}%"
    admin_id = "428237351"  # Admin's ID
    params = (search_term, search_term, search_term, admin_id, limit, offset)
    return getprocess(sql, params)