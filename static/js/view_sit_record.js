let currentPage = 1;
let perPage = 10;

// Fetch reserved students when the page loads
window.onload = function () {
    fetchReservedStudents(currentPage);
};

// Function to fetch reserved students
async function fetchReservedStudents(page = 1) {
    try {
        const url = `/view_sit_record?page=${page}&per_page=${perPage}`;
        const response = await fetch(url);
        const data = await response.json();
        console.log("Fetched data:", data); // Debugging
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
    tbody.innerHTML = '';

    if (students.length === 0) {
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
                <td>${student.status}</td>
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
            fetchReservedStudents(currentPage);
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
            fetchReservedStudents(currentPage);
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
            fetchReservedStudents(currentPage);
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

// Add event listener to the search button
document.getElementById('searchBtn').addEventListener('click', () => {
    const query = document.getElementById('searchInput').value.trim();
    fetchReservedStudents(1, query);
});