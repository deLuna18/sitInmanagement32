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

let currentPage = 1;
let perPage = 5; 

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
function displayRegisteredStudents(students) {
    const tbody = document.getElementById('registeredStudentsTableBody');
    tbody.innerHTML = ''; 

    if (students.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.setAttribute('colspan', '7'); 
        cell.textContent = 'No students found.';
        cell.style.textAlign = 'center';
        cell.style.padding = '20px';
        cell.style.fontStyle = 'italic';
        row.appendChild(cell);
        tbody.appendChild(row);
    } else {
        students.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <img src="/static/uploads/${student.profile_picture || 'default_profile.png'}" 
                         alt="Profile Picture" 
                         style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;">
                </td>
                <td>${student.idno}</td>
                <td>${student.firstname} ${student.middlename ? student.middlename + ' ' : ''}${student.lastname}</td>
                <td>${student.course}</td>
                <td>${student.year_level}</td>
                <td>${student.email_address}</td>
                <td>${student.username}</td>
            `;
            tbody.appendChild(row);
        });
    }
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

// Get the dropdown element
const entriesDropdown = document.getElementById('table_size');

// Add event listener to the dropdown
entriesDropdown.addEventListener('change', function () {
    const selectedValue = parseInt(this.value); // Get the selected value (10, 20, 50, 100)
    perPage = selectedValue; // Update the global perPage variable
    currentPage = 1; // Reset to the first page
    searchRegisteredStudents(currentPage); // Re-fetch data with the new limit
});

// Update the fetchAllRegisteredStudents and searchRegisteredStudents functions to use the global perPage variable
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