// =========================================== SIDEBAR ===========================================
// SIDEBAR DROPDOWN
const allDropdown = document.querySelectorAll('#sidebar .side-dropdown');
const sidebar = document.getElementById('sidebar');

allDropdown.forEach(item=> {
	const a = item.parentElement.querySelector('a:first-child');
	a.addEventListener('click', function (e) {
		e.preventDefault();

		if(!this.classList.contains('active')) {
			allDropdown.forEach(i=> {
				const aLink = i.parentElement.querySelector('a:first-child');

				aLink.classList.remove('active');
				i.classList.remove('show');
			})
		}

		this.classList.toggle('active');
		item.classList.toggle('show');
	})
})

// SIDEBAR COLLAPSE
const toggleSidebar = document.querySelector('nav .toggle-sidebar');
const allSideDivider = document.querySelectorAll('#sidebar .divider');

if(sidebar.classList.contains('hide')) {
	allSideDivider.forEach(item=> {
		item.textContent = '-'
	})
	allDropdown.forEach(item=> {
		const a = item.parentElement.querySelector('a:first-child');
		a.classList.remove('active');
		item.classList.remove('show');
	})
} else {
	allSideDivider.forEach(item=> {
		item.textContent = item.dataset.text;
	})
}

toggleSidebar.addEventListener('click', function () {
	sidebar.classList.toggle('hide');

	if(sidebar.classList.contains('hide')) {
		allSideDivider.forEach(item=> {
			item.textContent = '-'
		})

		allDropdown.forEach(item=> {
			const a = item.parentElement.querySelector('a:first-child');
			a.classList.remove('active');
			item.classList.remove('show');
		})
	} else {
		allSideDivider.forEach(item=> {
			item.textContent = item.dataset.text;
		})
	}
})

sidebar.addEventListener('mouseleave', function () {
	if(this.classList.contains('hide')) {
		allDropdown.forEach(item=> {
			const a = item.parentElement.querySelector('a:first-child');
			a.classList.remove('active');
			item.classList.remove('show');
		})
		allSideDivider.forEach(item=> {
			item.textContent = '-'
		})
	}
})

sidebar.addEventListener('mouseenter', function () {
	if(this.classList.contains('hide')) {
		allDropdown.forEach(item=> {
			const a = item.parentElement.querySelector('a:first-child');
			a.classList.remove('active');
			item.classList.remove('show');
		})
		allSideDivider.forEach(item=> {
			item.textContent = item.dataset.text;
		})
	}
})


// ============================== TABLE FUNCTIONALITY =================================



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

let currentPage = 1;  // Track the current page
const perPage = 10;   // Number of records per page

function updatePagination(total, page, perPage) {
    const paginationDiv = document.getElementById('pagination');
    paginationDiv.innerHTML = '';  // Clear existing pagination controls

    const totalPages = Math.ceil(total / perPage);

    // Previous Button
    if (page > 1) {
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.addEventListener('click', () => {
            currentPage = page - 1;
            fetchAllRegisteredStudents(currentPage);
        });
        paginationDiv.appendChild(prevButton);
    }

    // Next Button
    if (page < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.addEventListener('click', () => {
            currentPage = page + 1;
            fetchAllRegisteredStudents(currentPage);
        });
        paginationDiv.appendChild(nextButton);
    }
}


// PAGINATION

function updatePagination(total, page, perPage) {
    const paginationDiv = document.getElementById('pagination');
    paginationDiv.innerHTML = ''; 

    const totalPages = Math.ceil(total / perPage);

    // Previous Button
    if (page > 1) {
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.addEventListener('click', () => {
            currentPage = page - 1;
            searchRegisteredStudents(currentPage);
        });
        paginationDiv.appendChild(prevButton);
    }

    // Next Button
    if (page < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.addEventListener('click', () => {
            currentPage = page + 1;
            searchRegisteredStudents(currentPage);
        });
        paginationDiv.appendChild(nextButton);
    }
}

// DISPLAY 
function displayRegisteredStudents(students) {
    const tbody = document.getElementById('registeredStudentsTableBody');
    tbody.innerHTML = '';  // Clear existing rows

    if (students.length === 0) {
        // Display "No students found." message in the table
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.setAttribute('colspan', '6');  // Span all columns
        cell.textContent = 'No students found.';  // Message to display
        cell.style.textAlign = 'center';  // Center the text
        cell.style.padding = '20px';  // Add some padding
        cell.style.fontStyle = 'italic';  // Italicize the text
        row.appendChild(cell);
        tbody.appendChild(row);
    } else {
        // Display the list of students
        students.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
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



// Call this function when the page loads
window.onload = fetchAllRegisteredStudents;