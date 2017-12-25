(function(window, document, undefined) {
	let brandOptions;
	const bar = window.sessionStorage.getItem('bar');
	const table = document.querySelector('.beverages');
	const addBtn = document.querySelector('.addRow');
	const logOutBtn = document.querySelector('.logout');

	console.log(bar);
	getBarData(bar)
		.then(data => {
			const body = document.querySelector("tbody");
			createBeerTableBody(body, data);
			//updateTable(data.sort(sortBy("name", true)), globalVars.language);
		})
		.catch(error => console.log("getbardata " + error));
	
	getBrands().then(brands => brandOptions = createOptions(brands));
	
	addBtn.addEventListener('click', createInputRow);
	logOutBtn.addEventListener('click', logOut);


function createInputRow() {
	const deleteButton = document.createElement('td');
	const row = document.createElement('tr');
	deleteButton.innerHTML = `<img src="kgps_icons/x.svg" alt="X">`;
	deleteButton.classList.add('column-s', 'delete', 'clickable');
	deleteButton.addEventListener('click', (e) => deleteRow(e.target));
	row.classList.add('editing');
	row.innerHTML = `
		<td class="column-xs"><img src="kgps_icons/beer-bottle.svg"></td>
		<td class="column-l"><select class="selectBrand">${brandOptions}</select></td>
		<td class="column-m"><input type="text" placeholder="Tyyppi"></td>
		<td class="column-s"><input type="number" placeholder="L"></td>
		<td class="column-s"><input type="number" placeholder="%"></td>
		<td class="column-s"><input type="number" placeholder="€"></td>`;
	row.appendChild(deleteButton);
	table.appendChild(row);
}




function createOptions(brands) {
	let html = `<option disabled selected>Valitse Brändi</option>`;
	for (let brand of brands){
		html += `<option value="${brand}">${brand}</option>`
	}
	return html;
}

function getBrands() {
	return new Promise((resolve, reject) => {
		fetch("http://188.166.162.144:130/brands")
			.then(response => {
				return response.text();
			})
			.then(data => {
				let beerBrands = data.slice(1, -1).split(",");
				beerBrands = beerBrands.map(x => x.trim());
				beerBrands.sort();
				resolve(beerBrands);
			})
			.catch(error => reject(error));
	});
}

function getBarData(barName) {
	const url = "http://188.166.162.144:130/restaurant?name=" + barName.toLowerCase();
	return fetch(url).then(response => response.status !== 500 ? response.json() : null).catch(error => showErrorMessage("getBarDataError: " + error));
}


function createBeerTableBody(tableBody, beers) {
	let html = "";
	for(let i=0;i<beers.length;i++) {
		const beer = beers[i];
		const name = capitalize(beer.name);
		const type = capitalize(beer.type.split(',')[0]);
		const bottleIcon = "kgps_icons/beer-bottle.svg";
		const tapIcon = "kgps_icons/beer-tap.svg";
		const icon = beer.serving === "tap" ? tapIcon : bottleIcon;
		const iconAlt = beer.serving === "tap" ? 'Hana' : 'Pullo';
		
		const editButton = document.createElement('td');
		editButton.innerHTML = `<img src="kgps_icons/edit.svg" alt="Muokkaa">`;
		editButton.classList.add('column-s', 'edit', 'clickable');
		editButton.addEventListener('click', (e) => editRow(e.target));

		const row = document.createElement('tr');
		row.innerHTML = `
		<td class="column-xs"><img src=${icon} alt=${iconAlt}></td>
		<td class="column-l"><input type="text" placeholder="Nimi" value="${name}" readonly></td>
		<td class="column-m"><input type="text" placeholder="Tyyppi" value="${type}" readonly></td>
		<td class="column-s"><input type="number" placeholder="L" value=${beer.vol} min="0" step="0.1" readonly></td>
		<td class="column-s"><input type="number" placeholder="%" value=${beer.abv} min="0" step="0.1" readonly></td>
		<td class="column-s"><input type="number" placeholder="€" value=${beer.price} min="0" step="0.1" readonly></td>`;
		row.appendChild(editButton);
		tableBody.appendChild(row);
	}
	
	
	const rows = document.getElementsByTagName("tr");
	for (let i=0; i<rows.length; i++) {
		if(i % 2 !== 0) {
			rows[i].classList.add("odd-row");
		}
	}
}

function deleteRow(element) {
	const clicked = element.classList.contains('delete') ? element : element.parentNode;
	const currentRow = clicked.parentNode;
	currentRow.parentNode.removeChild(currentRow);
}

function editRow(element) {
	const clicked = element.classList.contains('edit') ? element : element.classList.contains('save') ? element : element.parentNode;
	const currentRow = clicked.parentNode;
	const cells = currentRow.querySelectorAll('td');
	const editSaveButton = currentRow.lastChild;
	const icon = editSaveButton.firstChild;
	toggleInputs(cells);	
	editSaveButton.classList.toggle('edit');
	editSaveButton.classList.toggle('save');
	icon.src = icon.src.includes("edit.svg") ? "kgps_icons/save.svg" : "kgps_icons/edit.svg";
	icon.alt = icon.alt === "Muokkaa" ? "Tallenna muutokset" : "Muokkaa";
}

function toggleInputs(cells) {
	for (let i=1; i<cells.length-1;i++) {
		const input = cells[i].querySelector('input') || null;
		input.readOnly = !input.readOnly;
		input.classList.toggle('editable');
	}
}


function logOut() {
	window.location.replace('login.html');
}


function capitalize(string) {
return string.charAt(0).toUpperCase() + string.slice(1);
}

})(window, document);
