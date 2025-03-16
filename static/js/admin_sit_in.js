// =============================================== SIDE BAR ===============================================
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



// SEARCH BARRRR
$(document).ready(function() {
	$('#searchBtn').on('click', function() {
		var searchValue = $('#searchInput').val().trim();

		if (searchValue) {
			$.ajax({
				url: "/search_reservation",
				method: "POST",
				data: { searchValue: searchValue },
				success: function(response) {
					if (response.error) {
						alert(response.error); // Kung walay nakuha nga data
					} else {
						$('#idNumber').val(response[0].idNumber);
						$('#studentName').val(response[0].studentName);
						$('#purpose').val(response[0].purpose);
						$('#lab').val(response[0].lab);
						$('#remainingSessions').val(response[0].remainingSessions);

						$('#sitInModal').css("display", "flex"); // Show modal
					}
				},
				error: function() {
					alert("Error fetching reservation data.");
				}
			});
		} else {
			alert("Please enter a search value.");
		}
	});

	$('#closeModal').on('click', function() {
		$('#sitInModal').hide(); // Isira ang modal
	});
});


// ACCEPT BUTTON

$(document).ready(function () {
	$("#acceptBtn").click(function () {
		const idNumber = $("#idNumber").val();

		$.ajax({
			url: "/accept_reservation",
			method: "POST",
			data: { 
				idNumber: idNumber,
				status: "Accepted"  
			},
			success: function (response) {
				alert(response.message);
				location.reload();  
			},
			error: function (xhr) {
				alert(xhr.responseJSON.error);
			}
		});
	});
});
