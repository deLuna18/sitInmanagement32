// =========================================== SIDEBAR ===========================================
const allDropdown = document.querySelectorAll('#sidebar .side-dropdown');
const sidebar = document.getElementById('sidebar');
const toggleSidebar = document.querySelector('nav .toggle-sidebar');
const allSideDivider = document.querySelectorAll('#sidebar .divider');

// SIDEBAR DROPDOWN
allDropdown.forEach(item => {
    const a = item.parentElement.querySelector('a:first-child');
    a.addEventListener('click', function (e) {
        e.preventDefault();

        if (!this.classList.contains('active')) {
            allDropdown.forEach(i => {
                const aLink = i.parentElement.querySelector('a:first-child');
                aLink.classList.remove('active');
                i.classList.remove('show');
            });
        }

        this.classList.toggle('active');
        item.classList.toggle('show');
    });
});

// SIDEBAR COLLAPSE
toggleSidebar.addEventListener('click', function () {
    sidebar.classList.toggle('hide');

    allSideDivider.forEach(item => {
        item.textContent = sidebar.classList.contains('hide') ? '-' : item.dataset.text;
    });

    if (sidebar.classList.contains('hide')) {
        allDropdown.forEach(item => {
            const a = item.parentElement.querySelector('a:first-child');
            a.classList.remove('active');
            item.classList.remove('show');
        });
    }
});

sidebar.addEventListener('mouseleave', function () {
    if (this.classList.contains('hide')) {
        allDropdown.forEach(item => {
            const a = item.parentElement.querySelector('a:first-child');
            a.classList.remove('active');
            item.classList.remove('show');
        });
        allSideDivider.forEach(item => {
            item.textContent = '-';
        });
    }
});

sidebar.addEventListener('mouseenter', function () {
    if (this.classList.contains('hide')) {
        allDropdown.forEach(item => {
            const a = item.parentElement.querySelector('a:first-child');
            a.classList.remove('active');
            item.classList.remove('show');
        });
        allSideDivider.forEach(item => {
            item.textContent = item.dataset.text;
        });
    }
});


// ============================== TABLE FUNCTIONALITY =================================
// ============================== TABLE FUNCTIONALITY =================================

let currentPage = 1;
let perPage = 5; 
let satInStudents = JSON.parse(localStorage.getItem('satInStudents')) || [];

// FETCH ALL REGISTERED STUDENTS
async function fetchAllRegisteredStudents(page = 1) {
    try {
        const response = await fetch(`/search_registered_students?page=${page}`);
        const data = await response.json();
        displayRegisteredStudents(data.students);
        updatePagination(data.total, data.page, data.per_page);
    } catch (error) {
        console.error("Error fetching students:", error);
        alert("An error occurred while fetching students. Please try again.");
    }
}

// SEARCH REGISTERED STUDENTS
async function searchRegisteredStudents(page = 1) {
    const query = document.getElementById('registeredSearchInput').value.trim();

    try {
        const response = await fetch(`/search_registered_students?query=${encodeURIComponent(query)}&page=${page}`);
        const data = await response.json();
        displayRegisteredStudents(data.students);
        updatePagination(data.total, data.page, data.per_page);
    } catch (error) {
        console.error("Error fetching search results:", error);
        alert("An error occurred while searching. Please try again.");
    }
}

// UPDATE PAGINATION
function updatePagination(total, page, perPage) {
    const paginationDiv = document.getElementById('pagination');
    paginationDiv.innerHTML = ''; 

    const totalPages = Math.ceil(total / perPage);

    // PREVIOUS BUTTON
    if (page > 1) {
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.id = 'prevPage';
        prevButton.addEventListener('click', () => {
            currentPage = page - 1;
            searchRegisteredStudents(currentPage);
        });
        paginationDiv.appendChild(prevButton);
    } else {
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.id = 'prevPage';
        prevButton.disabled = true;
        paginationDiv.appendChild(prevButton);
    }

    // PAGE NUMBER
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.classList.toggle('active', i === page);
        pageButton.addEventListener('click', () => {
            currentPage = i;
            searchRegisteredStudents(currentPage);
        });
        paginationDiv.appendChild(pageButton);
    }

    // NEXT BUTTON
    if (page < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.id = 'nextPage';
        nextButton.addEventListener('click', () => {
            currentPage = page + 1;
            searchRegisteredStudents(currentPage);
        });
        paginationDiv.appendChild(nextButton);
    } else {
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.id = 'nextPage';
        nextButton.disabled = true;
        paginationDiv.appendChild(nextButton);
    }
}

// DISPLAY
// DISPLAY FUNCTION WITH PERSISTENT STATES
function displayRegisteredStudents(students) {
    const tbody = document.getElementById('registeredStudentsTableBody');
    tbody.innerHTML = '';
    
    if (students.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" class="text-center py-4">No students found</td>
            </tr>
        `;
        return;
    }

    students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <img src="/static/uploads/${student.profile_picture || 'default_profile.png'}" 
                     class="profile-img">
            </td>
            <td>${student.idno}</td>
            <td>${student.firstname} ${student.lastname}</td>
            <td>${student.course}</td>
            <td>${student.year_level}</td>
            <td>${student.email_address}</td>
            <td>${student.username}</td>
            <td>
                <select class="form-select form-select-sm lab-select">
                    <option value="Lab 1">Lab 1</option>
                    <option value="Lab 2">Lab 2</option>
                    <option value="Lab 3">Lab 3</option>
                </select>
            </td>
            <td>
                <select class="form-select form-select-sm purpose-select">
                    <option value="Research">Research</option>
                    <option value="Project">Project</option>
                    <option value="Thesis">Thesis</option>
                    <option value="Other">Other</option>
                </select>
            </td>
            <td>
                <button class="btn btn-primary btn-sm sit-in-btn"
                        data-id="${student.idno}">
                    <i class="fas fa-chair"></i> Sit In
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Add sit-in button functionality
    // Modified sit-in button functionality
    document.querySelectorAll('.sit-in-btn').forEach(button => {
        button.addEventListener('click', async function() {
            const btn = this;
            const row = btn.closest('tr');
            const studentId = btn.dataset.id;
            
            try {
                // Show loading state
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                btn.disabled = true;

                const studentData = {
                    student_id: studentId,
                    student_name: row.cells[2].textContent,
                    course: row.cells[3].textContent,
                    year_level: row.cells[4].textContent,
                    lab: row.querySelector('.lab-select').value,
                    purpose: row.querySelector('.purpose-select').value
                };

                // Record the sit-in (if you still want to send to server)
                const response = await fetch('/sit-in/record', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    credentials: 'include',
                    body: JSON.stringify(studentData)
                });

                if (!response.ok) throw new Error('Failed to record sit-in');

                // Add to our local satInStudents list
                satInStudents.push(studentId);
                localStorage.setItem('satInStudents', JSON.stringify(satInStudents));

                // Remove the row immediately
                row.style.opacity = '0';
                setTimeout(() => row.remove(), 300);
                
                // Show success message
                alert('Sit-in recorded successfully!');
                
                // Check if table is empty
                const tbody = document.getElementById('registeredStudentsTableBody');
                if (tbody.querySelectorAll('tr').length === 1) {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="10" class="text-center py-4">No students remaining</td>
                        </tr>
                    `;
                }
                
            } catch (error) {
                console.error('Error:', error);
                btn.innerHTML = '<i class="fas fa-chair"></i> Sit In';
                btn.disabled = false;
                alert('Failed to record sit-in: ' + error.message);
            }
        });
    });

}

// Add this to clear sat-in records when needed (optional)
function clearSatInRecords() {
    localStorage.removeItem('satInStudents');
    satInStudents = [];
    alert('Sat-in records cleared!');
    fetchAllRegisteredStudents(currentPage);
}


// Helper function to get cookies
// Helper function to get CSRF token
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// DEBOUNCE SEARCH
let searchTimeout;
document.getElementById('registeredSearchInput').addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        searchRegisteredStudents(1);
    }, 300); // Adjust debounce time as needed
});

window.onload = fetchAllRegisteredStudents;


// ============================== ENTRIES DROPDOWN FUNCTIONALITY =================================

//DROPDOWN
const entriesDropdown = document.getElementById('table_size');

entriesDropdown.addEventListener('change', function () {
    const selectedValue = parseInt(this.value); 
    perPage = selectedValue; 
    currentPage = 1; 
    searchRegisteredStudents(currentPage); 
});

// FETCH
async function fetchAllRegisteredStudents(page = 1) {
    try {
        const response = await fetch(`/search_registered_students?page=${page}&per_page=${perPage}`);
        const data = await response.json();
        displayRegisteredStudents(data.students);
        updatePagination(data.total, data.page, data.per_page);
    } catch (error) {
        console.error("Error fetching students:", error);
        alert("An error occurred while fetching students. Please try again.");
    }
}

// SEARCH
async function searchRegisteredStudents(page = 1) {
    const query = document.getElementById('registeredSearchInput').value.trim();

    try {
        const response = await fetch(`/search_registered_students?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`);
        const data = await response.json();
        displayRegisteredStudents(data.students);
        updatePagination(data.total, data.page, data.per_page);
    } catch (error) {
        console.error("Error fetching search results:", error);
        alert("An error occurred while searching. Please try again.");
    }
}