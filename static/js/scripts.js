
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

// PROGRESSBAR
const allProgress = document.querySelectorAll('main .card .progress');

allProgress.forEach(item=> {
	item.style.setProperty('--value', item.dataset.value)
})

// APEXCHART - ENROLLMENT REPORT
let chart;

    function renderChart(data, categories, title) {
      const options = {
        series: [
          { name: title, data: data },
        ],
        chart: { height: 350, type: 'line' },
        colors: ['#5F3B71'],
        dataLabels: { enabled: false },
        stroke: { curve: 'straight', width: 2 },
        markers: { size: 4, colors: ['#5F3B71'] },
        xaxis: {
          categories: categories,
        },
        yaxis: {
          min: 0,
          max: Math.max(...data) + 5, // Dynamically adjust max value
          tickAmount: 5,
        },
        tooltip: {
          enabled: true,
          y: {
            formatter: function (val) {
              return "Enrollments: " + val;
            },
          },
        },
      };

      if (chart) {
        chart.updateOptions(options);
      } else {
        chart = new ApexCharts(document.querySelector("#chart"), options);
        chart.render();
      }
    }

    fetch('/api/enrollment-data')
      .then((response) => response.json())
      .then((enrollmentData) => {
        const timePeriodSelect = document.getElementById('timePeriod');

        timePeriodSelect.addEventListener('change', (event) => {
          const selectedPeriod = event.target.value;
          let data, categories, title;

          if (selectedPeriod === 'weekly') {
            data = enrollmentData.weekly;
            categories = Array.from({ length: enrollmentData.weekly.length }, (_, i) => `Week ${i + 1}`);
            title = 'Weekly Enrollment';
          } else if (selectedPeriod === 'monthly') {
            data = enrollmentData.monthly;
            categories = Array.from({ length: enrollmentData.monthly.length }, (_, i) => `Month ${i + 1}`);
            title = 'Monthly Enrollment';
          } else if (selectedPeriod === 'yearly') {
            data = enrollmentData.yearly;
            categories = Array.from({ length: enrollmentData.yearly.length }, (_, i) => `Year ${i + 1}`);
            title = 'Yearly Enrollment';
          }

          renderChart(data, categories, title);
        });

        // Initial render with weekly data
        const initialData = enrollmentData.weekly;
        const initialCategories = Array.from({ length: enrollmentData.weekly.length }, (_, i) => `Week ${i + 1}`);
        renderChart(initialData, initialCategories, 'Weekly Enrollment');
      });

// ANNOUNCEMENT 
document.addEventListener("DOMContentLoaded", function () {

    document.getElementById('announcementForm').style.display = 'none';

    // OPEN MODAL
    document.getElementById('openModal').addEventListener('click', function() {
        document.getElementById('announcementForm').style.display = 'flex';
    });

    // CLOSE MODAL (BUTTON)
    document.querySelector('.close')?.addEventListener('click', function() {
        document.getElementById('announcementForm').style.display = 'none';
    });

    // CLOSE MODAL (CANCEL BUTTON)
    document.getElementById('cancelAnnouncement').addEventListener('click', function(event) {
        event.preventDefault(); 
        console.log("Cancel button clicked!"); 
        document.getElementById('announcementForm').style.display = 'none';
    });

	// SAVE ANNOUNCEMENT
	document.getElementById('saveAnnouncement').addEventListener('click', function() {
		console.log("Save button clicked!"); 
		let title = document.getElementById('announcementFormTitle').value.trim();
		let content = document.getElementById('announcementFormContent').value.trim();
		console.log('Title:', title); 
		console.log('Content:', content); 
		if (title && content) {
			fetch('/add_announcement', {
				method: 'POST',
				headers: { 
					'Content-Type': 'application/json' 
				},
				body: JSON.stringify({ 'title': title, 'content': content })
			})
			.then(response => response.json())
			.then(data => {
				console.log("Server response:", data); 
				if (data.success) {
					window.location.reload();  
				} else {
					alert("Failed to save announcement.");
				}
			})
			.catch(error => console.error("Error:", error));
		} else {
			alert("Title and content are required.");
		}
	});
	

	// PARA MA CLICKABLE ANG ROWS
	$(document).ready(function() {
		$('#announcementTable').on('click', '.announcement-row', function() {
			const title = $(this).data('title');
			const content = $(this).data('content');
			const datePosted = $(this).data('date-posted');

			$('#announcementTitle').text(title);
			$('#announcementContent').text(content);
			$('#announcementDate').text(datePosted);
			$('#announcementDetailsModal').fadeIn();
		});

		window.closeAnnouncementDetailsModal = function() {
			$('#announcementDetailsModal').fadeOut();
		};
	});


	// DELETE ANNOUNCEMENT 
	window.deleteAnnouncement = function(id) {
		if (!confirm("Are you sure you want to delete this announcement?")) return;
	
		$.ajax({
			url: `/delete-announcement/${id}`,
			type: 'POST',  
			success: function(response) {
				if (response.success) {
					alert("Announcement deleted successfully.");
					location.reload();  
				} else {
					alert(response.message || "Failed to delete the announcement.");
				}
			},
			error: function() {
				alert("An error occurred while deleting the announcement.");
			}
		});
	};
	
	//EDIT  ANNOUNCEMENT 
	let currentAnnouncementId = null;

	// OPEN MODAL
	window.editAnnouncement = function(id) {
		currentAnnouncementId = id;
		$('#announ_cusModal').fadeIn(); 
	};

	// CLOSE MODAL
	$('.announ_cus-close-btn').click(function() {
		$('#announ_cusModal').fadeOut();
	});

	// CLOSE MODAL WHEN CLICKING OUTSIDE
	$(window).click(function(event) {
		if ($(event.target).is('#announ_cusModal')) {
			$('#announ_cusModal').fadeOut();
		}
	});

	// FORM SUBMIT
	$('#announ_cusForm').submit(function(e) {
		e.preventDefault();

		const newContent = $('#announ_cusContent').val().trim();

		if (!newContent) {
			alert("Please enter the announcement content.");
			return;
		}

		$.ajax({
			url: `/edit-announcement/${currentAnnouncementId}`,
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify({ content: newContent }),
			success: function(response) {
				if (response.success) {
					alert("Announcement updated successfully.");
					location.reload();
				} else {
					alert(response.message || "Failed to update the announcement.");
				}
			},
			error: function(xhr) {
				console.error("Error details:", xhr.responseText);
				alert("An error occurred while updating the announcement.");
			}
		});

		$('#announ_cusModal').fadeOut();
	});


	// SEARCH BARRRR



	// TOTAL STUDENTS - KADTUNG PROGRESS BAR SA CARD
	fetch('/api/total-students')
    .then(response => response.json())
    .then(data => {
        const totalStudents = data.total_students;

        document.getElementById('total-students').textContent = totalStudents;

        const maxCapacity = 200; 
        const percentage = Math.round((totalStudents / maxCapacity) * 100);

        const progress = document.querySelector('.progress');
        progress.style.setProperty('--value', `${percentage}%`); 
        progress.style.width = '100%'; 
        progress.setAttribute('data-value', `${percentage}%`);

        
        const label = document.querySelector('.label');
        label.textContent = `${percentage}%`;
    })
    .catch(error => {
        console.error('Error fetching total students:', error);
    });



	// TOTAL RESERVATIONS - KADTUNG PROGRESS BAR SA CARD
	fetch('/api/total_reservations')
    .then(response => response.json())
    .then(data => {
        const totalReservations = data.total_reservations; 
		
        document.getElementById('total-reservations').textContent = totalReservations;

        const maxCapacity = 150; 
        const percentage = Math.round((totalReservations / maxCapacity) * 100);

       
        const progress = document.querySelector('.progress');
        progress.style.setProperty('--value', `${percentage}%`); 
        progress.style.width = '100%'; 
        progress.setAttribute('data-value', `${percentage}%`); 

        
        const label = document.querySelector('.label');
        label.textContent = `${percentage}%`;
    })
    .catch(error => {
        console.error('Error fetching total reservations:', error);
    });
	
	
});

// SEARCH RESERVED STUDENTS - Triggers when the search button is clicked
function searchReservedStudents() {
    const query = document.getElementById('searchInput').value.trim();

    if (query.length > 0) {
        fetch(`/search_reserved_students?query=${query}`)
            .then(response => response.json())
            .then(data => {
                if (data.students.length > 0) {
                    const student = data.students[0]; 

                    // Automatically open the modal for the first student result
                    openSitInModal(student);
                    document.getElementById('openModalBtn').style.display = 'none';  // Hide the button

                } else {
                    alert("No reserved students found.");
                    document.getElementById('openModalBtn').style.display = 'none';  // Hide the button if no results
                }
            })
            .catch(error => {
                console.error('Error fetching reserved students:', error);
            });
    } else {
        // Hide the button if search input is empty
        document.getElementById('openModalBtn').style.display = 'none';  
    }
}

// SEARCH BUTTON
document.getElementById('searchBtn').addEventListener('click', searchReservedStudents);
// FUNCTION TO OPEN MODAL AND POPULATE A STUDENT DATA 
function openSitInModal(student) {
    document.getElementById('idNumber').value = student.idno;
    document.getElementById('studentName').value = student.student_name;
    document.getElementById('purpose').value = student.purpose;
    document.getElementById('lab').value = student.lab;
    document.getElementById('remainingSessions').value = student.remaining_sessions;

    // SHOW MODAL
    document.getElementById('sitInModal').style.display = 'flex';
}

// CLOSE MODAL
document.getElementById('closeModal').onclick = function() {
    document.getElementById('sitInModal').style.display = 'none';
};

// ACCEPT BUTTON
document.getElementById('acceptBtn').onclick = function() {
    const idNumber = document.getElementById('idNumber').value;
    fetch(`/accept_reservation`, {
        method: 'POST',
        body: new URLSearchParams({ idNumber: idNumber })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error accepting reservation:', error);
    });

    // CLOSE MODAL AFTER ACCEPTING
    document.getElementById('sitInModal').style.display = 'none';
};

// REJECT BUTTON
document.getElementById('rejectBtn').onclick = function() {
    const idNumber = document.getElementById('idNumber').value;
    fetch(`/reject_reservation`, {
        method: 'POST',
        body: new URLSearchParams({ idNumber: idNumber })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error rejecting reservation:', error);
    });

    // CLOSE MODAL
    document.getElementById('sitInModal').style.display = 'none';
};
