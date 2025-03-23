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
let perPage = 10; // Default entries per page

// Fetch reserved students when the page loads
window.onload = function () {
    fetchViewSitInRecords(currentPage);
};

// Function to fetch reserved students for View Sit-In Records
async function fetchViewSitInRecords(page = 1, query = '') {
    try {
        const url = `/api/view_sit_in_records?page=${page}&per_page=${perPage}&query=${query}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched data:", data); // Debugging

        if (!data.students) {
            throw new Error("No students data found in the response.");
        }

        displayReservedStudents(data.students);
        updatePagination(data.total_students, data.page, data.per_page);
    } catch (error) {
        console.error("Error fetching reserved students:", error);
        alert("An error occurred while fetching reserved students. Please try again.");
    }
}

// Function to display reserved students
function displayReservedStudents(students) {
    const tbody = document.getElementById('reservedStudentsTableBody');
    tbody.innerHTML = ''; // Clear existing rows

    if (students.length === 0) {
        // Display a message if no students are found
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.setAttribute('colspan', '10');
        cell.textContent = 'No reserved students found.';
        cell.style.textAlign = 'center';
        cell.style.padding = '20px';
        cell.style.fontStyle = 'italic';
        row.appendChild(cell);
        tbody.appendChild(row);
    } else {
        // Populate the table with student data
        students.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.idno}</td>
                <td>${student.student_name}</td>
                <td>${student.course}</td>
                <td>${student.year_level}</td>
                <td>${student.purpose}</td>
                <td>${student.lab}</td>
                <td>${student.time_in}</td>
                <td>${student.date}</td>
                <td>${student.remaining_sessions}</td>
                <td>
                    <span class="status-badge status-${student.status.toLowerCase()}">
                        ${student.status}
                    </span>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
}

// Update pagination
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
            fetchViewSitInRecords(currentPage);
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
            fetchViewSitInRecords(currentPage);
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
            fetchViewSitInRecords(currentPage);
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



// SEARCH
let searchTimeout;
document.getElementById('registeredSearchInput').addEventListener('input', function () {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const query = this.value.trim();
        fetchViewSitInRecords(1, query);
    }, 300);
});

// ENTRIES
document.getElementById('table_size').addEventListener('change', function () {
    perPage = parseInt(this.value);
    currentPage = 1;
    fetchViewSitInRecords(currentPage);
});