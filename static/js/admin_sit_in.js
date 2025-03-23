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

  // FETCH RESERVED STUDENTS
  async function fetchReservedStudents(page = 1) {
    try {
        const url = `/api/reserved_students?page=${page}&per_page=${perPage}`;
        console.log("Fetching data from:", url); 

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched data:", data); 

        displayReservedStudents(data.students);
        updatePagination(data.total_students, data.page, data.per_page);
    } catch (error) {
        console.error("Error fetching reserved students:", error);
        alert("An error occurred while fetching reserved students. Please try again.");
    }
}

//   DISPLAY
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

//   UPDATE PAGINATION
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

  window.onload = function () {
	  fetchReservedStudents(currentPage); 
  };

  // ============================== ENTRIES DROPDOWN FUNCTIONALITY =================================
// DROPDOWN
  const entriesDropdown = document.getElementById('table_size');

  entriesDropdown.addEventListener('change', function () {
	  const selectedValue = parseInt(this.value); 
	  perPage = selectedValue; 
	  currentPage = 1; 
	  fetchReservedStudents(currentPage); 
  });

  // ============================== SEARCH FUNCTIONALITY =================================
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
		  fetchReservedStudents(currentPage); 
	  }
  }

  // ============================== MODAL FUNCTIONALITY =================================

  function openSitInModal(student) {
	  document.getElementById('idNumber').value = student.idno;
	  document.getElementById('studentName').value = student.student_name;
	  document.getElementById('purpose').value = student.purpose;
	  document.getElementById('lab').value = student.lab;
	  document.getElementById('remainingSessions').value = student.remaining_sessions;

	  document.getElementById('sitInModal').style.display = 'flex';
  }

  document.getElementById('closeModal').onclick = function() {
	  document.getElementById('sitInModal').style.display = 'none';
  };

// ACCEPT RESERVATION
function acceptReservation(idno) {
    if (confirm("Are you sure you want to accept this reservation?")) {
        fetch(`/accept_reservation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({ idno: idno })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.message) {
                alert(data.message);
                console.log("Reservation accepted. Removing row from table..."); 
                removeRowFromTable(idno);
            } else if (data.error) {
                alert(data.error); 
            }
        })
        .catch(error => {
            console.error('Error accepting reservation:', error);
            alert("An error occurred while accepting the reservation. Please try again.");
        });
    }
}

// REJECT RESERVATION
function rejectReservation(idno) {
    if (confirm("Are you sure you want to reject this reservation?")) {
        fetch(`/reject_reservation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({ idno: idno })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.message) {
                alert(data.message);
                console.log("Reservation rejected. Removing row from table..."); 
                removeRowFromTable(idno);
            } else if (data.error) {
                alert(data.error);
            }
        })
        .catch(error => {
            console.error('Error rejecting reservation:', error);
            alert("An error occurred while rejecting the reservation. Please try again.");
        });
    }
}

// REMOVE ROW
function removeRowFromTable(idno) {
    const tbody = document.getElementById('reservedStudentsTableBody');
    const rows = tbody.getElementsByTagName('tr');

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowIdno = row.cells[0].textContent; 
        if (rowIdno === idno) {
            tbody.removeChild(row); 
            break;
        }
    }
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