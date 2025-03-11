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




// PROFILE DROPDOWN
const profile = document.querySelector('nav .profile');
const imgProfile = profile.querySelector('img');
const dropdownProfile = profile.querySelector('.profile-link');

imgProfile.addEventListener('click', function () {
	dropdownProfile.classList.toggle('show');
})




// MENU
const allMenu = document.querySelectorAll('main .content-data .head .menu');

allMenu.forEach(item=> {
	const icon = item.querySelector('.icon');
	const menuLink = item.querySelector('.menu-link');

	icon.addEventListener('click', function () {
		menuLink.classList.toggle('show');
	})
})



window.addEventListener('click', function (e) {
	if(e.target !== imgProfile) {
		if(e.target !== dropdownProfile) {
			if(dropdownProfile.classList.contains('show')) {
				dropdownProfile.classList.remove('show');
			}
		}
	}

	allMenu.forEach(item=> {
		const icon = item.querySelector('.icon');
		const menuLink = item.querySelector('.menu-link');

		if(e.target !== icon) {
			if(e.target !== menuLink) {
				if (menuLink.classList.contains('show')) {
					menuLink.classList.remove('show')
				}
			}
		}
	})
})





// PROGRESSBAR
const allProgress = document.querySelectorAll('main .card .progress');

allProgress.forEach(item=> {
	item.style.setProperty('--value', item.dataset.value)
})






// APEXCHART
var options = {
  series: [{
  name: 'series1',
  data: [31, 40, 28, 51, 42, 109, 100]
}, {
  name: 'series2',
  data: [11, 32, 45, 32, 34, 52, 41]
}],
  chart: {
  height: 350,
  type: 'area'
},
dataLabels: {
  enabled: false
},
stroke: {
  curve: 'smooth'
},
xaxis: {
  type: 'datetime',
  categories: ["2018-09-19T00:00:00.000Z", "2018-09-19T01:30:00.000Z", "2018-09-19T02:30:00.000Z", "2018-09-19T03:30:00.000Z", "2018-09-19T04:30:00.000Z", "2018-09-19T05:30:00.000Z", "2018-09-19T06:30:00.000Z"]
},
tooltip: {
  x: {
    format: 'dd/MM/yy HH:mm'
  },
},
};

var chart = new ApexCharts(document.querySelector("#chart"), options);
chart.render();




document.addEventListener("DOMContentLoaded", function () {

    // Make sure modal is hidden when page loads
    document.getElementById('announcementForm').style.display = 'none';

    // Open Modal
    document.getElementById('openModal').addEventListener('click', function() {
        document.getElementById('announcementForm').style.display = 'flex';
    });

    // Close Modal (Close button)
    document.querySelector('.close')?.addEventListener('click', function() {
        document.getElementById('announcementForm').style.display = 'none';
    });

    // Close Modal (Cancel button)
    document.getElementById('cancelAnnouncement').addEventListener('click', function(event) {
        event.preventDefault(); 
        console.log("Cancel button clicked!"); 
        document.getElementById('announcementForm').style.display = 'none';
    });


	document.getElementById('saveAnnouncement').addEventListener('click', function() {
		let titleElement = document.getElementById('announcementFormTitle');
		let contentElement = document.getElementById('announcementFormContent');
	
		console.log("Title Element:", titleElement);  
		console.log("Content Element:", contentElement);  
	
		if (!titleElement || !contentElement) {
			console.error("Error: Element not found.");
			return;
		}
	
		let title = titleElement.value.trim();
		let content = contentElement.value.trim();
	
		console.log("Title Value:", title);  
		console.log("Content Value:", content);  
	
		if (title !== "" && content !== "") {
			fetch('/add_announcement', {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: new URLSearchParams({ 'title': title, 'content': content })
			})
			.then(response => response.text())  
			.then(data => {
				console.log("Server response:", data);  
				window.location.reload();
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


});

