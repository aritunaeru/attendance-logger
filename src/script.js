const currentTime = new Date().getTime();
let previousEntries = [];

//  fetch data from data.json
async function fetchData() {
	try {
		const response = await fetch('data.json');
		if (!response.ok) {
			throw new Error('Failed to fetch data');
		}
		const data = await response.json();

		previousEntries = data.previousEntries || [];
		displayPreviousEntries();
	} catch (error) {
		console.error(error);
	}
}

fetchData();

let timeoutId; // Variable to store the timeout ID

function showToast(str) {
	const snackbar = document.getElementById('snackbar');
	snackbar.textContent = String(str);
	snackbar.style.visibility = 'visible';

	// Clear any existing timeout
	clearTimeout(timeoutId);

	// Set a new timeout
	timeoutId = setTimeout(function() {
		snackbar.style.visibility = 'hidden';
	}, 3000);
}

function generateUniqueId() {
	const randomNo = Math.floor(1000 + Math.random() * 9000);
	return `${Date.now().toString(36)}${randomNo}`;
}

async function logAttendance() {
	displayPreviousEntries();

	let inputName = String(document.getElementById('attendeeName').value);
	// ipacapital tanan letters!
	inputName = inputName?.toUpperCase();
	const cleanedInput = cleanSearchInput(inputName);
	inputName = cleanedInput;
	if (inputName === '') {
		showToast('Invalid input. The name is either blank or not a name. Please input a name.');
		return;
	}

	if (inputName.length > 30) {
		showToast('Invalid input. You have reached the maximum character limit.');
		return;
	}

	if (previousEntries.some(entry => entry.inputName === inputName)) {
		showToast(`Invalid input. ${inputName} already exists.`);
		return;
	}

	showToast(`Successfully added ${inputName}`);


	const id = generateUniqueId();
	const time = formatDate(new Date());
	document.getElementById('attendeeId').textContent = `Your ID: ${id}`;

	previousEntries.push({
		inputName,
		id,
		time,
	});

	await writeData(previousEntries);

	displayPreviousEntries();
}

const ENTRIES_PER_PAGE = 5;
let currentPage = 1;

function displayPreviousEntries() {
	const entriesDiv = document.getElementById('previousEntries');

	const startIndex = (currentPage - 1) * ENTRIES_PER_PAGE;
	const endIndex = startIndex + ENTRIES_PER_PAGE;

	entriesDiv.innerHTML = '<h2>Previous Entries: </h2>';

	previousEntries.slice(startIndex, endIndex).forEach((entry, index) => {
		entriesDiv.innerHTML += `<p><span class="index">${startIndex + index + 1}.</span> <span class="entry">Name: ${entry.inputName}<br>Entry ID: ${entry.id}<br>Entry Time: ${entry.time}</span></p>`;
	});

	if (previousEntries.length > ENTRIES_PER_PAGE) {
		renderPaginationControls(entriesDiv);
	}
}

function renderPaginationControls(entriesDiv) {
	const totalPages = Math.ceil(previousEntries.length / ENTRIES_PER_PAGE);

	const paginationDiv = document.createElement('div');
	paginationDiv.classList.add('pagination');
	paginationDiv.style.display = 'flex';

	const pageInfo = document.createElement('span');
	pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
	paginationDiv.appendChild(pageInfo);

	const buttonsContainer = document.createElement('div');
	buttonsContainer.style.marginLeft = 'auto';
	paginationDiv.appendChild(buttonsContainer);

	// Prev button
	const prevButton = document.createElement('button');
	prevButton.textContent = 'Prev';
	prevButton.style.marginRight = '5px';
	prevButton.addEventListener('click', () => {
		if (currentPage > 1) {
			currentPage--;
			displayPreviousEntries();
		} else {
			showToast('You are already at the first page.');
			return;
		}
	});
	buttonsContainer.appendChild(prevButton);

	const nextButton = document.createElement('button');
	nextButton.textContent = 'Next';
	nextButton.addEventListener('click', () => {
		if (currentPage < totalPages) {
			currentPage++;
			displayPreviousEntries();
		} else {
			showToast('You are already at the last page.');
			return;
		}
	});
	buttonsContainer.appendChild(nextButton);

	entriesDiv.appendChild(paginationDiv);
}

/*
async function writeData(data) {
	console.log('Writing data...');
	try {
		await fetch('data.json', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ previousEntries: data }, null, 2),
		});
	} catch (error) {
		console.error(error);
	}
}
*/
// temporary code:
async function writeData(data) {
	console.log('Writing data...');
	try {
		await fetch('data.json', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ previousEntries: data }, null, 2),
		});
	} catch (error) {
		console.error(error);
	}
}


async function clearOldData() {
	const twentyTwoHours = 22 * 60 * 60 * 1000;

	const filteredEntries = previousEntries.filter(entry => {
		const entryTime = new Date(entry.time).getTime();
		console.log('Entry time:', entryTime);
		return currentTime - entryTime <= twentyTwoHours;
	});

	if (filteredEntries.length === previousEntries.length) {
		showToast('No entries older than 22 hours.');
		return;
	}

	showToast('Cleared data older than 22 hours.');

	previousEntries = filteredEntries;
	await writeData(previousEntries);
	displayPreviousEntries();
}


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

function searchEntries() {
	const searchInput = document.getElementById('searchInput').value.trim().toLowerCase();

	if (searchInput === '') {
		showToast('Search input is empty.');
		displayPreviousEntries();
		return;
	}

	if (searchInput.length > 30) {
		showToast('Invalid search. You have reached the maximum character limit.');
		return;
	}

	const searchResults = previousEntries.filter(entry => {
		const formattedTime = formatDate(new Date(entry.time));
		return entry.inputName.toLowerCase().includes(searchInput) || entry.id.includes(searchInput) || formattedTime.includes(searchInput);
	});

	const entriesDiv = document.getElementById('previousEntries');
	entriesDiv.innerHTML = '<h2>Search Results:</h2>';

	if (searchResults.length === 0) {
		entriesDiv.innerHTML += '<p>No matching entries found.</p>';
		showToast('No matching entries found.');
		return;
	}
	showToast(`Found ${searchResults.length} entr${searchResults.length > 1 ? 'ies' : 'y'}.`);

	searchResults.forEach((entry, index) => {
		entriesDiv.innerHTML += `<p><span class="index">${index + 1}.</span> <span class="entry">Name: ${entry.inputName}<br>Entry ID: ${entry.id}<br>Entry Time: ${entry.time}</span></p>`;
	});
}

const cleanSearchInput = (input) => {
	const desired = input.replace(/[^\w\s.]/gi, ''); // Exclude dots from replacement
	return desired;
};

document.addEventListener('keydown', async (event) => {
	if (event.key === 'Enter' && event.target.id === 'attendeeName') {
		await logAttendance();
	}
	if (event.key === 'Enter' && event.target.id === 'searchInput') {
		searchEntries()();
	}
});
