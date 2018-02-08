(function(window, document, undefined) {
	let brandOptions;
	const names =
		"[Cocoa wonderland, Oktoberfest Bier, Ahomansikka-Raparperi, Old Empire IPA, Breezer Lime, Hardcore IPA, Brooklyn Scorcher, Päärynä, Crowmoor, Long Drink Vodka Lime, Long Drink Pink, Keisari 66, Kronmbacher Pils, Long Kyrö Cranberry & Rosemary, Moood, Pirate Dog, Huvila Brown Ale, Brooklyn Lager, Omena Sirpakka, Budvar Vaalea, Papan Vanillastout, Sour Head Maracuja, Sandels IV, Garage Punch, Somersby Blueberry, Happy Joe Apple, US Red Ale, Hoegaarden, Imperial Vehnä Ale, Koff III, Vintage, Kukko Lager, Perry, Magners Apple, Pekoniolut, Arctic Circle Ale, Westons Vintage, Omenasiideri, Double Doc, Kesäkolli, Somersby Perry, Stadin Pacific IPL, Piper Wit, Lempi Puolukka, Genious Lab Porter, Vehnä, Puisto Session Ipa, Virmalised IPA, Breezer Mango, Nanny State, Budejovicky Budvar, Chimay Blue, Frisco Disco, ESB, Donut Island Ich Bin Ein Berner, Koff IPA, Krušovice Imperial, Lapin Kulta Pure Luomu, Aventinus, Steam Lager, 5 AM Saint Red Ale, Emmer Tripel, Brooklyn Naranjito, Karpalolonkero, Bulmers, Cloudberry Saison, Sour Head Ginger, Porter, Garage Grape, Investor IPA, Hartwall Original Cranberry, Ginger Joe, Karhu III, Tin Soldiers Black Apple, Sima, Thornbridge Jaipur, Imperiaali Stout, Urquell, Magners, Kuiva Omena, American Pale Ale, Green's IPA, Newcastle Brown Ale, Kauppa IPA, Kuukkari Greippi IPA, Somersby Secco Apple, III Long Neck, Sparre Pale Ale, Katy, Golden Vicious Cider, Vehnäbock, Weihenstephaner Hefe, Kronenbourg Blanc, Brooklyn American Ale, Budejovicky Dark, Cool Mate, Franziskaner, Guinness, Inki Gluteeniton Ginger Pale, Koff APA, Kukko Pils, Sinebrychoff Classic Long Drink, Breezer Pear, Onni, Punk IPA, Belge, Brooklyn Sorachi Ace, IPA 347, Omena, Ruby Jazz Ale, Corona Extra, Sol, Gin Long Drink Cranberry, Katariina Imperial Stout, Heineken, Seth Lager, Karhu Tosi Vahva, Lempi Mustikka, Kronenbourg, Hippie Juice, Brändy Long Drink, Pils, Kaira, Orion, Dinkel, Old Engine Oil, Kuningatar Sirpakka, Bourbon Barrel Aged Imperial Stout, Sandels III, Somersby, Pale Ale, Helsinki Portteri, Old Rascal, Golden Vicious Apple Cider, Savukataja, Henry Westons Vintage Cider, Weihenstephaner, Brooklyn East IPA, Budvar Tumma, Heavy Sunshine, Garage Lemonade, Cloudy Apple, Jaipur IPA, Kona Big Wave, Mississippi, Magners Pear, Breezer Pineapple, Blond Ale, 1/2 Ale, Murphy's Irish Stout, Brooklyn IPA, Pilsner Urquell, Carlsberg III, Paperi, Confirmation Beer, Somersby Apple, Fuller's - London Pride, Summery Helles Pils, Frisco Disco Citra IPA, Coyet Ale, Koff Light Beer, Thatchers, Krušovice Cerné, Top Fuel Hippie Juice IPA, Lapin Kulta IV, Savu Kataja, Maku IPA, Weihenstephaner Kristal, Emmer Ipa, Black Fox, Lonkero, Vahva Portteri, Sinebrychoff Classic Lime, Somersby Blackberry, Stella Artois, Tin Soldiers Hard Cider, Old Rosie, Perry Light, Terva Juhlaolut, Old Rosie Scrumpy, Aura III, Crimson Red Ale, Brooklyn Local 1, Strongbow, Corona, Garage Hard Lemonade, Hefe/Dunkel, Karhu A, Skipper's ALE, Oiva Kuiva Luomuomenasiideri, Brett Sonja, Bavaria Wit, Columbus Pale Ale, Brooklyn Defender IPA, Elowehnä, Budejovicky Original, Bitch de Elegant, IPAnema, Saku Tume, Finlandia Sahti, Somersby Pear, Fullers IPA, Honungsöl, IKU-Turso, Hoppe Ipa, Koff Porter, Green Goblin, Long Kyrö Cranberry, Hippie Juice IPA, Leffe Blonde, DIPA, Top Hat Ale, Weihen Kristall, Huvila X-Porter, Original Long Drink, Pyynikin Saison, Smirnoff Ice, New Enland Spelt Ale, Höpken Pils, Kaski]";
	let beverageNames = names.slice(1, -1).split(',');
	beverageNames = beverageNames.map(name => name.trim());
	beverageNames.sort();
	const bar = window.sessionStorage.getItem('bar');
	const table = document.querySelector('.beverages');
	const addBtn = document.querySelector('.addRow');
	const logOutBtn = document.querySelector('.logout');

	document.querySelector('table').innerHTML += createOptions(
		beverageNames,
		'beverageNames'
	);

	getTypes().then(
		types =>
			(document.querySelector('table').innerHTML += createOptions(
				types,
				'types'
			))
	);

	console.log(bar);
	getBarData(bar)
		.then(data => {
			const body = document.querySelector('tbody');
			createBeerTableBody(body, data);
			//updateTable(data.sort(sortBy("name", true)), globalVars.language);
		})
		.catch(error => console.log('getbardata ' + error));

	addBtn.addEventListener('click', createInputRow);
	logOutBtn.addEventListener('click', logOut);

	function createInputRow() {
		const body = table.querySelector('tbody');
		const saveRowButton = document.createElement('td');
		const row = document.createElement('tr');
		row.innerHTML = `
		<td class="column-xs"><img src="kgps_icons/beer-bottle.svg"></td>
		<td class="column-l"><input class="editable" list="beverageNames" placeholder="Nimi"></input></td>
		<td class="column-m"><input class="editable" list="types" placeholder="Tyyppi"></td>
		<td class="column-s"><input class="editable" type="number" placeholder="Koko"></td>
		<td class="column-s"><input class="editable" type="number" placeholder="Alk-%"></td>
		<td class="column-s"><input class="editable" type="number" placeholder="Hinta"></td>`;
		saveRowButton.innerHTML = `<img src="kgps_icons/save.svg" alt="Lisää Tuote">`;
		saveRowButton.classList.add('column-s', 'save', 'clickable');
		saveRowButton.addEventListener('click', e =>
			toggleEditMode(getRowElement(e.target))
		);
		row.appendChild(saveRowButton);
		if (evenRow()) {
			row.classList.add('odd-row');
		}
		body.appendChild(row);

		console.log(row);
	}

	function createOptions(beverageNames, id) {
		let html = `<datalist id=${id}>`;
		for (let brand of beverageNames) {
			html += `<option value="${brand}">`;
		}
		html += `</datalist>`;
		return html;
	}

	function getTypes() {
		return new Promise((resolve, reject) => {
			fetch('http://188.166.162.144:130/beveragetypes')
				.then(response => {
					return response.text();
				})
				.then(data => {
					let beerTypes = data.slice(1, -1).split(',');
					beerTypes = beerTypes.map(x => x.trim());
					beerTypes = beerTypes.filter(
						(type, index, beerTypes) => index % 2 === 0
					);
					beerTypes.sort();
					resolve(beerTypes);
				})
				.catch(error => reject(error));
		});
	}

	function getBarData(barName) {
		const url =
			'http://188.166.162.144:130/restaurant?name=' +
			barName.toLowerCase();
		return fetch(url)
			.then(
				response => (response.status !== 500 ? response.json() : null)
			)
			.catch(error => showErrorMessage('getBarDataError: ' + error));
	}

	function createBeerTableBody(tableBody, beers) {
		let html = '';
		for (let i = 0; i < beers.length; i++) {
			const beer = beers[i];
			const name = capitalize(beer.name);
			const type = capitalize(beer.type.split(',')[0]);
			const bottleIcon = 'kgps_icons/beer-bottle.svg';
			const tapIcon = 'kgps_icons/beer-tap.svg';
			const icon = beer.serving === 'tap' ? tapIcon : bottleIcon;
			const iconAlt = beer.serving === 'tap' ? 'Hana' : 'Pullo';
			const editButton = document.createElement('td');
			editButton.innerHTML = `<img src="kgps_icons/edit.svg" alt="Muokkaa">`;
			editButton.classList.add('column-s', 'edit', 'clickable');
			editButton.addEventListener('click', e =>
				toggleEditMode(getRowElement(e.target))
			);

			if (beer.price === Number.MAX_VALUE) {
				beer.price = '';
			}

			const row = document.createElement('tr');
			row.innerHTML = `
		<td class="column-xs"><img src=${icon} alt=${iconAlt}></td>
		<td class="column-l"><input type="text" placeholder="Nimi" value="${name}" readonly></td>
		<td class="column-m"><input type="text" placeholder="Tyyppi" value="${type}" readonly></td>
		<td class="column-s"><input type="number" placeholder="Koko" value=${
			beer.vol
		} min="0" step="0.1" readonly></td>
		<td class="column-s"><input type="number" placeholder="Alk-%" value=${
			beer.abv
		} min="0" step="0.1" readonly></td>
		<td class="column-s"><input type="number" placeholder="Hinta" value=${
			beer.price
		} min="0" step="0.1" readonly></td>`;
			row.appendChild(editButton);
			tableBody.appendChild(row);
		}

		const rows = document.getElementsByTagName('tr');
		for (let i = 0; i < rows.length; i++) {
			if (i % 2 !== 0) {
				rows[i].classList.add('odd-row');
			}
		}
	}

	function getRowElement(element) {
		const clicked =
			element.classList.contains('edit') ||
			element.classList.contains('save') ||
			element.classList.contains('delete')
				? element
				: element.parentNode;
		const currentRow = clicked.parentNode;
		return currentRow;
	}

	function deleteRow(rowElement) {
		rowElement.parentNode.removeChild(rowElement);
	}

	function toggleEditMode(row) {
		const cells = row.querySelectorAll('td');
		const lastIndex = cells.length - 1;
		const saveEditButton = cells[lastIndex];
		const icon = saveEditButton.querySelector('img');
		const serving = cells[0];
		serving.addEventListener('click', e => toggleServing(e.target));
		for (let i = 1; i < cells.length - 1; i++) {
			const input = cells[i].querySelector('input') || null;
			input.readOnly = !input.readOnly;
			input.classList.toggle('editable');
		}

		saveEditButton.classList.toggle('edit');
		saveEditButton.classList.toggle('save');
		icon.src = icon.src.includes('edit.svg')
			? 'kgps_icons/save.svg'
			: 'kgps_icons/edit.svg';
		icon.alt = icon.alt === 'Muokkaa' ? 'Tallenna muutokset' : 'Muokkaa';
	}

	function evenRow() {
		const tbody = document.querySelector('tbody');
		const rows = tbody.querySelectorAll('tr').length;
		console.log(rows % 2);
		return rows % 2;
	}

	function toggleServing(clicked) {
		console.log(clicked);
	}

	function logOut() {
		window.localStorage.setItem('token', '');
		window.location.replace('login.html');
	}

	function capitalize(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}
})(window, document);
