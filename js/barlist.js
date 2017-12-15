(function(window, document, undefined) {
	let brandOptions;
	const list = document.querySelector('ol');
	const addBtn = document.querySelector('.addRow');

	
	getBrands().then(brands => brandOptions = createOptions(brands));
	
	addBtn.addEventListener('click', createInputRow);


function createInputRow() {
	const count = countFromTop();
	console.log(brandOptions);
	const row = `
	<li>
		<select class="selectBrand">${brandOptions}</select>
		<input type="text" placeholder="Syötä hinta">
		<input type="text" placeholder="Syötä koko">
		<div class="selectServing">
			<input type="radio" name="serving${count}" value="tap" id="tap${count}" checked>
			<label class="disable-select clickable" for="tap${count}">Hana</label>
			<input type="radio" name="serving${count}" value="bottle" id="bottle${count}">
			<label class="disable-select clickable" for="bottle${count}">Pullo</label>
		</div>
		<button class="deleteItem">
			<img src="kgps_icons/x.svg" alt="X">
		</button>
	</li>`;
	list.innerHTML += row;
}

function createOptions(brands) {
	let html = `<option disabled selected>Valitse Brändi</option>`;
	for (let brand of brands){
		html += `<option value="${brand}">${brand}</option>`
	}
	console.log(html);
	return html;
}

function countFromTop() {
	const items = list.querySelectorAll('li');
	return items.length+1;
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

})(window, document);
