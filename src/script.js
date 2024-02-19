const attendeeIds = readDatabase().attendeeIds || {};
let previousEntries = readDatabase().previousEntries || [];
console.log(previousEntries);
const snackbar = document.getElementById('snackbar');
const currentTime = new Date().getTime();

function showError(errMsg) {
	snackbar.className = 'show';
	snackbar.textContent = String(errMsg);
	setTimeout(function() {
		snackbar.className = snackbar.className.replace('show', '');
	}, 3000);
}

function generateUniqueId() {
	const randomNo = Math.floor(1000 + Math.random() * 9000);
	return `${Date.now().toString(36)}${randomNo}`;
}

function logAttendance() {
	const inputName = String(document.getElementById('attendeeName').value);
	if (inputName === '') {
		showError('Invalid input. The name is blank, please input a name.');
		return;
	}

	console.log(inputName.length);
	if (inputName.length > 30) {
		showError('Invalid input. You have reached the maximum character limit.');
		return;
	}
	// kung pariha ang pangalan ang gi input sa user kumpara sa na save sa localstorage
	if (previousEntries?.some(entry => entry.inputName === inputName)) {
		showError('Invalid input. The name already exists.');
		return;
	}
	const id = generateUniqueId();
	const time = formatDate(new Date());
	// Display the ID
	document.getElementById('attendeeId').textContent = `Your ID: ${id}`;

	// Store the ID
	attendeeIds[inputName] = id;
	attendeeIds[time] = time;
	localStorage.setItem('attendeeIds', JSON.stringify(attendeeIds));

	// Add to previous entries
	previousEntries.push({
		inputName,
		id,
		time,
	});
	localStorage.setItem('previousEntries', JSON.stringify(previousEntries));

	// Display previous entries
	displayPreviousEntries();
}

function displayPreviousEntries() {
	const entriesDiv = document.getElementById('previousEntries');

	entriesDiv.innerHTML = '<h2>Previous Entries:</h2>';

	// Loop through previousEntries array and append each entry to entriesDiv

	previousEntries.forEach((entry, index) => {
		entriesDiv.innerHTML += `<p><span class="index">${index + 1}.</span> <span class="entry">Name: ${entry.inputName}<br>Entry ID: ${entry.id}<br>Entry Time: ${entry.time}</span></p>`;
	});
}

// Function to clear old entries
function clearOldData() {
	const twentyTwoHours = 22 * 60 * 60 * 1000; // 22 hours in milliseconds

	previousEntries = previousEntries.filter(entry => {
		const entryTime = new Date(entry.time).getTime();
		return currentTime - entryTime <= twentyTwoHours;
	});

	localStorage.setItem('previousEntries', JSON.stringify(previousEntries));
}
// Call the function only once
displayPreviousEntries();


function formatDate(date) {
	const options = {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: 'numeric',
		minute: 'numeric',
		hour12: true,
	};
	return date.toLocaleDateString('en-US', options);
}
