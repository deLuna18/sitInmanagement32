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

  // Function to fetch and display reserved students
  async function fetchReservedStudents(page = 1) {
    try {
        const url = `/api/reserved_students?page=${page}&per_page=${perPage}`;
        console.log("Fetching data from:", url); // Debugging

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched data:", data); // Debugging

        displayReservedStudents(data.students);
        updatePagination(data.total_students, data.page, data.per_page);
    } catch (error) {
        console.error("Error fetching reserved students:", error);
        alert("An error occurred while fetching reserved students. Please try again.");
    }
}

  // Function to display reserved students in the table
  function displayReservedStudents(students) {
    const tbody = document.getElementById('reservedStudentsTableBody');
    tbody.innerHTML = ''; // Clear the table body

    if (students.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.setAttribute('colspan', '10'); // Adjust colspan based on the number of columns
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
                <td>${student.course || 'N/A'}</td>
                <td>${student.year_level || 'N/A'}</td>
                <td>${student.purpose}</td>
                <td>${student.lab}</td>
                <td>${student.time_in || 'N/A'}</td>
                <td>${student.date || 'N/A'}</td>
                <td>${student.remaining_sessions}</td>
                <td>
                    <div class="action-buttons">
                        <button class="accept-btn" onclick="acceptReservation('${student.idno}')">Accept</button>
                        <button class="reject-btn" onclick="rejectReservation('${student.idno}')">Reject</button>
                        <button class="reset-btn" onclick="resetSessions('${student.idno}')">Reset Session</button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
}

  // Update the pagination function to handle reserved students
  function updatePagination(total, page, perPage) {
	  const paginationDiv = document.getElementById('pagination');
	  paginationDiv.innerHTML = ''; // Clear existing pagination buttons

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

  // Fetch reserved students when the page loads
  window.onload = function () {
	  fetchReservedStudents(currentPage); // Fetch the first page of reserved students
  };

  // ============================== ENTRIES DROPDOWN FUNCTIONALITY =================================

  // Get the dropdown element
  const entriesDropdown = document.getElementById('table_size');

  // Add event listener to the dropdown
  entriesDropdown.addEventListener('change', function () {
	  const selectedValue = parseInt(this.value); // Get the selected value (10, 20, 50, 100)
	  perPage = selectedValue; // Update the global perPage variable
	  currentPage = 1; // Reset to the first page
	  fetchReservedStudents(currentPage); // Re-fetch data with the new limit
  });

  // ============================== SEARCH FUNCTIONALITY =================================

  // Function to search registered students
  function searchRegisteredStudents() {
	  const query = document.getElementById('registeredSearchInput').value.trim();
	  if (query.length > 0) {
		  fetch(`/search_reserved_students?query=${query}`)
			  .then(response => response.json())
			  .then(data => {
				  displayReservedStudents(data.students);
			  })
			  .catch(error => {
				  console.error('Error searching reserved students:', error);
			  });
	  } else {
		  fetchReservedStudents(currentPage); // Reset to the original list if search is empty
	  }
  }

  // ============================== MODAL FUNCTIONALITY =================================

  // Function to open the modal with student details
  function openSitInModal(student) {
	  document.getElementById('idNumber').value = student.idno;
	  document.getElementById('studentName').value = student.student_name;
	  document.getElementById('purpose').value = student.purpose;
	  document.getElementById('lab').value = student.lab;
	  document.getElementById('remainingSessions').value = student.remaining_sessions;

	  // Show the modal
	  document.getElementById('sitInModal').style.display = 'flex';
  }

  // Close the modal
  document.getElementById('closeModal').onclick = function() {
	  document.getElementById('sitInModal').style.display = 'none';
  };

// Accept reservation
function acceptReservation(idno) {
    fetch(`/accept_reservation`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ idno: idno })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert(data.message);
            fetchReservedStudents(currentPage); 
        }
    })
    .catch(error => {
        console.error('Error accepting reservation:', error);
    });
}

// Reject reservation
function rejectReservation(idno) {
    fetch(`/reject_reservation`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ idno: idno })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert(data.message);
            fetchReservedStudents(currentPage); 
        }
    })
    .catch(error => {
        console.error('Error rejecting reservation:', error);
    });
}

// RESET SESSION
function resetSessions(idno) {
    if (confirm("Are you sure you want to reset this student's sessions?")) {
        fetch(`/reset_sessions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({ idno: idno })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert(data.message);
                fetchReservedStudents(currentPage); 
            }
        })
        .catch(error => {
            console.error('Error resetting sessions:', error);
            alert("An error occurred while resetting sessions. Please try again.");
        });
    }
}