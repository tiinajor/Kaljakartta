let map;
let pos;
let infowindow;
let markers = [];

loadScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyDuIpE10xbisU_de-Mg_xR4-OpmOVl3BxA&libraries=places&language=fi&region=FI", initMap);

/* 
- Reittiohjeiden klikkaaminen poistaa kaikki markerit ja näyttää vain lähtöpaikan sekä kohteen
- Reittiohjeiden musta palkki ei liiku, kun reittiohjeita scrollataan
- Restaurant cardin element heights, juomalista voi mennä näytön ulkopuolelle?

*/
let beerlist = [];


window.onload = function(){
	const priceSlider = document.getElementById('price-slider');
	const alcoholSlider = document.getElementById('alcohol-slider');
	const distanceSlider = document.getElementById('distance-slider');
	const directionsButtons = document.getElementsByClassName('directions-button');
	const handle = document.querySelector('.draggable');
	const headerElement = document.querySelector('header');
	const mapElement = document.getElementById('map');
	const menuElement = document.getElementById('side-menu');
	const restaurantCard = document.getElementById('restaurant-card');
	const oof = document.getElementById('oof');
	const theads = document.getElementsByTagName('th');
	const servingButtons = document.querySelectorAll('.serving-button');
	const directionsElement = document.getElementById('route-container');
	const directionsService = new google.maps.DirectionsService;
	const directionsRenderer = new google.maps.DirectionsRenderer({suppressMarkers: true});
	let headerHeight = headerElement.clientHeight;
	let windowHeight = window.innerHeight;
	let serving = "";
	let language = window.localStorage.getItem("language") || "fi";
	let mouseDown = false;
	let mouseStartPos;
	let handleOffset;
	let directionsMaxHeight;
	let mapMinHeight;
	//beertable sorting order per column
	let servingAsc = false;
	let typeAsc = false;
	let nameAsc = true;
	let volAsc = false;
	let abvAsc = false;
	let priceAsc = false;

	const searchVars = {
		serving : serving,
		price : 8.5,
		abvMin : 2.8,
		abvMax : 5.6,
		brands : [],
		types : []
	};
	directionsRenderer.setPanel(document.getElementById("route"));
	infowindow = new google.maps.InfoWindow();
	document.querySelector(".title-link").innerHTML += ("<sup class='version'>alpha</sup>");

	//showModal();
	localizeContent(language);
	createBeerTable(language);

	Array.from(servingButtons).forEach((e) => e.addEventListener("click", (e) => searchVars.serving = toggleServing(e.target)));	

	Array.from(theads).forEach((e) => e.addEventListener("click", function() {
		const column = e.getAttribute("data-id");
		const language = window.localStorage.getItem("language");
		const inactiveSortIcon = "kgps_icons/sort-icon-inactive.png";
		const ascSortIcon = "kgps_icons/sort-icon-ascend.png";
		const descSortIcon = "kgps_icons/sort-icon-descend.png";
		let sortedValues;
		let activeSortIcon;
		
		switch(column) {
		case "serving":
			servingAsc = !servingAsc;
			sortedValues = beerList.sort(sortBy(column, servingAsc));
			updateTable(sortedValues, language);
			activeSortIcon = servingAsc ? descSortIcon : ascSortIcon;
			break;
		case "name":
			nameAsc = !nameAsc;
			sortedValues = beerList.sort(sortBy(column, nameAsc));
			updateTable(sortedValues, language);
			activeSortIcon = nameAsc ? descSortIcon : ascSortIcon;
			break;
		case "type":
			typeAsc = !typeAsc;
			sortedValues = beerList.sort(sortBy(column, typeAsc));
			updateTable(sortedValues, language);
			activeSortIcon = typeAsc ? descSortIcon : ascSortIcon;
			break;
		case "abv":
			abvAsc = !abvAsc;
			sortedValues = beerList.sort(sortBy(column, abvAsc));
			updateTable(sortedValues, language);
			activeSortIcon = abvAsc ? descSortIcon : ascSortIcon;
			break;
		case "vol":
			volAsc = !volAsc;
			sortedValues = beerList.sort(sortBy(column, volAsc));
			updateTable(sortedValues, language);
			activeSortIcon = volAsc ? descSortIcon : ascSortIcon;
			break;
		case "price":
			priceAsc = !priceAsc;
			sortedValues = beerList.sort(sortBy(column, priceAsc));
			updateTable(sortedValues, language);
			activeSortIcon = priceAsc ? descSortIcon : ascSortIcon;
			break;
		default:
			break;
		}

		for (let i = 0; i < theads.length; i++) {
			if (theads[i].childNodes.length > 0) {
				theads[i].childNodes[0].src = (theads[i] === e) ? activeSortIcon : inactiveSortIcon;
			}
		}
	}));

	document.querySelector(".button-cancel").addEventListener("click", swapLanguage);

	document.getElementById("fi").addEventListener("click", (e) => swapLanguage(e.target.id));
	document.getElementById("en").addEventListener("click", (e) => swapLanguage(e.target.id));


	// asettaa kartan, menun, reittiohjeiden sekä baarikortin korkeuden ja korjaa niitä aina kun ikkunan koko muuttuu
	resizeElementHeights();
	window.addEventListener("resize", debounce(resizeElementHeights,100,false));

	/*
	// hanat mukana haussa kyllä/ei
	document.getElementById("tapButton").addEventListener("click", function() {
		this.classList.toggle("selected");
		this.classList.toggle("selected-border");
		if(searchVars.serving == "" || searchVars.serving == "bottle") {
			searchVars.serving = "tap";
		} else {
			searchVars.serving = "";
		}
	});

	// pullot mukana haussa kyllä/ei
	document.getElementById("bottleButton").addEventListener("click", function() {
		this.classList.toggle("selected");
		if(searchVars.serving == "" || searchVars.serving == "tap") {
			searchVars.serving = "bottle";
		} else {
			searchVars.serving = "";
		}
	});
	*/

	// kartan päällä olevan hakukentän suurennuslasi etsii osoitteen mukaan baarit jos osoite ei ole tyhjä
	document.getElementById("search-button").addEventListener("click", function() {
		const input = document.getElementById("searchbox");
		const address = input.value;
		if(address != "") {
			directionsRenderer.setMap(null);
			clearMarkers();
			geocodeAddress(address, distance, infowindow);
			input.value = "";
		}
	});


	// hakukentässä enterin painaminen käynnistää haun myös
	document.getElementById("searchbox").addEventListener("keyup", function(e) {
		e.preventDefault();
		const input = document.getElementById("searchbox");
		const distance = distanceSlider.noUiSlider.get();
		const address = input.value;
		if(e.keyCode == 13 && address != ""){ 
			directionsRenderer.setMap(null);
			clearMarkers();
			geocodeAddress(address, distance, infowindow);
			this.value = "";
		}
	});

	// avaa merkit-listan ja sulkee muut listat
	document.getElementById("brand-list").children[0].addEventListener("click", function() {
		let ul = document.getElementById("brand-list").children[1];
		let icon = this.children[1];
		toggleVisible(ul);
		rotateIcon(icon);
		closeList(document.getElementById("type-list"));
	});

	// avaa oluttyypit-listan ja sulkee muut listat
	document.getElementById("type-list").children[0].addEventListener("click", function() {
		let ul = document.getElementById("type-list").children[1];
		let icon = this.children[1];
		console.log(icon);
		toggleVisible(ul);
		rotateIcon(icon);
		closeList(document.getElementById("brand-list"));
	});

	// menun avaus
	document.getElementById("hamburger-menu").addEventListener("click", () => {
		openMenu();
		// hakee menuun oluttyypit
		fetch("https://cors-anywhere.herokuapp.com/http://188.166.162.144:130/beertypes")
			.then(response => {return response.text()})
			.then(data => {
				let beerTypes = data.slice(1,-1).split(",");
				beerTypes = beerTypes.map(x => {return x.trim()});
				createList(beerTypes, document.getElementById("type-list"), "types", searchVars)
			})
			.catch(err => console.log("Fetch Error: ", err));

		// hakee menuun olutmerkit
		setTimeout(() => {fetch("https://cors-anywhere.herokuapp.com/http://188.166.162.144:130/brands")
			.then(response => {
				if (!response.ok) {
					throw Error(response.statusText);
				}
				return response.text();
			})
			.then(data => {
				let beerBrands = data.slice(1,-1).split(",");
				beerBrands = beerBrands.map(x => {return x.trim()});
				createList(beerBrands, document.getElementById("brand-list"), "brands", searchVars);
			})
			.catch(err => createList(["Error 404", "No beer found", err], document.getElementById("brand-list"), "brands", searchVars))
		},500);
	});

	// käyttäjän GPS paikannus
	document.getElementById('locate').addEventListener('click', () => {
		document.getElementById('route-container').style.height = 0+"px";
		document.getElementById('search-container').style.position = "absolute";
		resizeElementHeights();
		clearMarkers();
		directionsRenderer.setMap(null);
		locateUser(distanceSlider.noUiSlider.get(), infowindow);
	});

	// menun sulkeminen
	document.getElementById("menu-close-x").addEventListener("click", closeMenu);

	// "restaurant cardin" sulkeminen
	document.getElementById("card-close-x").addEventListener("click", closeCard);

	// modaalin sulkeminen
	document.getElementById("modal-close-x").addEventListener("click", hideModal);

	// out of focus alueen klikkaaminen sulkee kaikki
	document.getElementById("oof").addEventListener("click",(e) => {
		if(e.target === oof) {
			hideModal();
			closeCard();
			closeMenu();
		}
	});

	// reittiohjeen sulkeminen
	document.getElementById("route-close-x").addEventListener("click", function() {
		directionsRenderer.setMap(null);
		closeDirections();
		resizeElementHeights();
	});

	// reittioheiden koon muuttaminen koneella
	handle.addEventListener('mousedown', (e) => {
		mouseStartPos = { x: e.pageX, y: e.pageY };
		mouseDown = true;
		handleOffset = mouseStartPos.y - handle.getBoundingClientRect().top;
		const routeOptionsHeight = document.querySelector('.adp-list') != null ? document.querySelector('.adp-list').clientHeight : 0;
		directionsMaxHeight = document.querySelector('.adp').clientHeight  + routeOptionsHeight + 24;
		mapMinHeight = windowHeight - headerHeight - directionsMaxHeight;
	});
	window.addEventListener("mouseleave", () => mouseDown = false);
	window.addEventListener("mouseup", () => mouseDown = false);
	window.addEventListener("mousemove", (e) => {
		if(!mouseDown) return;
		e.preventDefault();
		const handleTopPos = e.pageY - handleOffset;
		const directionsHeight = windowHeight - handleTopPos;
		const mapHeight = windowHeight - directionsHeight - headerHeight;		
		mapElement.style.height = (mapHeight > mapMinHeight) ? mapHeight + "px" : mapMinHeight + "px";
		setTimeout(() => {
			directionsElement.style.height = (directionsHeight < directionsMaxHeight) ? directionsHeight + "px" : directionsMaxHeight + "px";
		}, 100);
		
	});

	//reittiohjeiden koon muuttaminen mobiilissa
	handle.addEventListener("touchstart", (e) => {
		e.preventDefault();
		mouseStartPos = {x: e.touches[0].pageX, y: e.touches[0].pageY};
		mouseDown = true;
		handleOffset = mouseStartPos.y - handle.getBoundingClientRect().top;
		const routeOptionsHeight = document.querySelector('.adp-list') !== null ? document.querySelector('.adp-list').clientHeight : 0;
		directionsMaxHeight = document.querySelector('.adp').clientHeight  + routeOptionsHeight + 24;
		mapMinHeight = windowHeight - headerHeight - directionsMaxHeight;
	});
	window.addEventListener("touchend", () => mouseDown = false);
	window.addEventListener("touchcancel", () => mouseDown = false);
	window.addEventListener("touchmove", (e) => {
		if(!mouseDown || e.touches.length === 0) return;
		e.preventDefault();
		const handleTopPos = e.touches[0].pageY - handleOffset;
		const directionsHeight = windowHeight - handleTopPos;
		const mapHeight = windowHeight - directionsHeight - headerHeight;		
		mapElement.style.height = (mapHeight > mapMinHeight) ? mapHeight + "px" : mapMinHeight + "px";
		setTimeout(() => {
			directionsElement.style.height = (directionsHeight < directionsMaxHeight) ? directionsHeight + "px" : directionsMaxHeight + "px";
		}, 150);
		
	});

	// menun voi avata pyyhkäisemällä vasemmasta reunasta
	mapElement.addEventListener("touchstart", (e) => {
		const boolean = !(e.changedTouches[0].pageX < 25);
		map.setOptions({ draggable: boolean});
		mouseStartPos = {x: e.changedTouches[0].pageX, y: e.changedTouches[0].pageX};
	});
	mapElement.addEventListener("touchend", (e) => {
		const moveAmount = e.changedTouches[0].pageX - mouseStartPos.x;
		if(mouseStartPos.x < 25 && moveAmount > 50) {
			openMenu();
		}
	});

	// menun voi sulkea pyyhkäisemällä sitä vasemmalle
	menuElement.addEventListener("touchstart", (e) => mouseStartPos = {x: e.changedTouches[0].pageX, y: e.changedTouches[0].pageX});
	menuElement.addEventListener("touchend", (e) => {
		const moveAmount = mouseStartPos.x - e.changedTouches[0].pageX;
		if(moveAmount > 50) {
			closeMenu();
		}
	});

	//ravintolakortin voi sulkea pyyhkäisemällä sitä oikealle
	restaurantCard.addEventListener("touchstart", (e) => mouseStartPos = {x: e.changedTouches[0].pageX, y: e.changedTouches[0].pageX});
	restaurantCard.addEventListener("touchend", (e) => {
		const moveAmount = e.changedTouches[0].pageX - mouseStartPos.x;
		if(moveAmount > 150) {
			closeCard();
		}
	});

	// reittiohjenapit asettaa reitin kulkuneuvon napin ID:n mukaan
	Array.from(directionsButtons).forEach((e) => e.addEventListener("click", function() {
		const endPoint = document.getElementById("bar-address").textContent;
		const barName = document.getElementById("bar-name").textContent;
		const mode = e.id.toUpperCase();
		calcRoute(directionsService,directionsRenderer,endPoint,mode);
		//geocodeAddress(barName, 1);
	}));

	//slaiderien luonti
	noUiSlider.create(priceSlider, {
		start: 8.5,
		connect: [true, false],
		step: 0.5,
		range: {
			"min": [  0 ],
			"max": [ 25 ]
		},
		format: wNumb({
			decimals: 1,
		})
	});
	noUiSlider.create(alcoholSlider, {
		start: [ 2.8, 5.6 ],
		connect: true,
		range: {
			"min": [ 0 ],
			"max": [ 12 ]
		},
		format: wNumb({
			decimals: 1,
		})
	});
	noUiSlider.create(distanceSlider, {
		start: 500,
		connect: [true, false],
		range: {
			"min": [  0, 50 ],
			"50%": [  1000, 500 ],
			"max": [ 5000 ]
		},
		format: wNumb({
			decimals: 0,
		})
	});

	// slaidereiden liikuttaminen päivittää niihin liittyvät tekstit
	priceSlider.noUiSlider.on("update", function() {
		const value = priceSlider.noUiSlider.get();
		document.getElementById("price").innerHTML = "0 - " + value + "€";
	});
	alcoholSlider.noUiSlider.on("update", function() {
		const value = alcoholSlider.noUiSlider.get();
		document.getElementById("alcohol").innerHTML = value[0] + " - " + value[1] + "%";
	});
	distanceSlider.noUiSlider.on("update", function() {
		const value = distanceSlider.noUiSlider.get();
		document.getElementById("distance").innerHTML = "< " + value + "m";
	});

	// slaidereiden siirtäminen päivittää hakukriteerit
	priceSlider.noUiSlider.on("change", function() {
		const value = priceSlider.noUiSlider.get();
		searchVars.price = value[1];  
	});
	alcoholSlider.noUiSlider.on("change", function() {
		const value = alcoholSlider.noUiSlider.get();
		searchVars.alcohol.min = value[0];
		searchVars.alcohol.max = value[1];
	});


};
// ---- WINDOW.ONLOAD LOPPU ---- 



/**
 *  Creates the thead and an empty tbody to ".beers-table" element in the restaurant card.
 * 
 */
function createBeerTable(language) {
	const table = document.querySelector(".beers-table");
	const locale = language === "en" ? en_GB : fi_FI;
	let html = `
	<thead>
	<tr>
		<th class="column-xs" data-id="serving"></th>
		<th class="column-l" data-id="name"><img src="kgps_icons/sort-icon-descend.png"/>${locale.restaurantCard.beersTable.name}</th>
		<th class="column-m" data-id="type"><img src="kgps_icons/sort-icon-inactive.png"/>${locale.restaurantCard.beersTable.type}</th>
		<th class="column-s" data-id="vol"><img src="kgps_icons/sort-icon-inactive.png"/>${locale.restaurantCard.beersTable.vol}</th>
		<th class="column-s" data-id="abv"><img src="kgps_icons/sort-icon-inactive.png"/>${locale.restaurantCard.beersTable.abv}</th>
		<th class="column-s" data-id="price"><img src="kgps_icons/sort-icon-inactive.png"/>${locale.restaurantCard.beersTable.price}</th>
	</tr>
	</thead>
	<tbody>
	</tbody>`;

	table.innerHTML = html;
}

/**
 * Creates the content of the ".beers-table" element from the given list.
 *
 * @param {List} beerList List of the beers that the clicked bar has. 
 */
function createBeerTableBody(beerList) {
	const tableBody = document.querySelector("tbody");
	let html = "";
	for(let i=0;i<beerList.length;i++) {
		const beer = beerList[i];
		const name = capitalizeFirstLetter(beer.name);
		const type = capitalizeFirstLetter(beer.type);
		const bottleIcon = "kgps_icons/beer-bottle.svg";
		const tapIcon = "kgps_icons/beer-tap.svg";
		let src = "";
		beer.serving === "tap" ? src=tapIcon : src=bottleIcon;
		html += `
		<tr>
		<td class="column-xs"><img src=${src} alt="pullot"></td>
		<td class="column-l">${name}</td>
		<td class="column-m">${type}</td>
		<td class="column-s">${beer.vol}</td>
		<td class="column-s">${beer.abv}</td>
		<td class="column-s">${beer.price}</td>
		</tr>`;
	}
	tableBody.innerHTML = html;
	const rows = document.getElementsByTagName("tr");
	for (let i=0; i<rows.length; i++) {
		if(i % 2 !== 0) {
			rows[i].classList.add("odd-row");
		}
	}
}

/**
 * Updates the content of the ".beers-table" element from the given list.
 *"
 * @param {List} beerList Updated list of the beers that the clicked bar has. 
 */
function updateTable(beerList, language) {
	const rows = document.querySelector("tbody").rows;
	const bottleIcon = "kgps_icons/beer-bottle.svg";
	const tapIcon = "kgps_icons/beer-tap.svg";
	for(let i = 0; i < beerList.length; i++){
		const icon = beerList[i].serving === "tap" ? tapIcon : bottleIcon;
		const vol = beerList[i].vol === 0 ? "?" : beerList[i].vol + "l";
		const abv = beerList[i].abv === 0 ? "?" : beerList[i].abv + "%";
		const price = beerList[i].price === 0 ? "?" : beerList[i].price + "€";

		let beerType = "?";
		if(beerList[i].type !== 0) {
			const typeLocales = (beerList[i].type.indexOf(",") > 0) ? beerList[i].type.split(",") : beerList[i].type;
			if(typeof(typeLocales) === "object") {
				beerType = language === "fi" ? typeLocales[0] : typeLocales[1];
			} else {
				beerType = typeLocales;
			}	
		}			
		rows[i].cells[0].innerHTML = `<img src=${icon}>`;
		rows[i].cells[1].textContent = capitalizeFirstLetter(beerList[i].name);
		rows[i].cells[2].textContent = capitalizeFirstLetter(beerType);
		rows[i].cells[3].textContent = vol;
		rows[i].cells[4].textContent = abv;
		rows[i].cells[5].textContent = price;
	}
}


/**
 * Helper function to sorting the beerlist by a certain column. Takes two values from the list and compares them to each other.
 * If the values are unknown (=0) they will be treated as 999 so that they are last in the sort.
 *
 * @param {String} col The column that the items should be sorted by.
 * @param {boolean} ascendingOrder Determines if the items are sorted in ascending or descending order. Default value is true.
 * @returns {number} Returns 0 if the values are the same, 1 if the first value is smaller and -1 if the second value is smaller. The return values are reversed when ascendingOrder is false.
 */
function sortBy(col, ascendingOrder=true) {
	return function(a, b) {
		let x = a[col];
		let y = b[col];
		if(x === 0) x = 999;
		if(y === 0) y = 999;
		if(typeof x === "string" && typeof y === "string") {
			return ascendingOrder ? x.localeCompare(y) : y.localeCompare(x);
		} else {
			return ascendingOrder ? (parseFloat(x) - parseFloat(y)) : (parseFloat(y) - parseFloat(x));
		}    
	};
}

/**
 * Gets the beerlist of the given bar from our API.
 *
 * @param {String} barName The name of the bar that you need the beerlist for.
 * @returns {Object} Returns the beerlist as a JSON or return null if the request status is 500. 
 */
function getBarData(barName) {
	const url = "https://cors-anywhere.herokuapp.com/http://188.166.162.144:130/restaurant?name=" + barName.toLowerCase();
	console.log(url);
	return fetch(url).then(response => response.status !== 500 ? response.json() : null);
}

/*
 * Raw post method for sending data to our backend.
 *
function postJSON(url, param) {
	let xhr = new XMLHttpRequest();
	xhr.open("POST", url+param, true);
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.send(); 
	xhr.onreadystatechange = function () {
		if (xhr.readyState == 4 && xhr.status == 200) {
			//console.log(xhr.responseText);               
		}
	};
}
*/

function swapLanguage(language) {
	window.localStorage.setItem("language", language);
	window.location.reload();
}

/**
 * Creates a list inside the given element in alphabetical order.
 *
 * @param {List} list The list of items to be inserted to the parent element.
 * @param {HTMLElement} parentDiv The parent element where the list will be created. 
 * @param {string} id The ID that will be given to the list element.
 * @param {Object} searchVars An object which contains the search variables.
 */
function createList(list, parentDiv, id, searchVars) {
	const ul = document.createElement("ul");
	ul.id = id;
	for (var i = 0; i<list.length; i++) {
		list[i] = capitalizeFirstLetter(list[i]);
	}
	list = removeDuplicates(list);
	list = list.sort();
	for (let i = 0; i<list.length; i++) {
		let li = document.createElement("li");
		let content = document.createTextNode(list[i]);
		li.appendChild(content);
		li.addEventListener("click", () => toggleInSearch(li, searchVars));
		ul.appendChild(li);	
	}
	parentDiv.appendChild(ul);
}

/**
 * Closes the given list.
 *
 * @param {HTMLElement} div The div which contains the list element.
 */
function closeList(div) {
	const otherList = div.children[1];
	const otherDiv = div.children[0];
	const icon = otherDiv.children[1];
	otherList.style.height = "0px";
	icon.style.transform = "rotate(-90deg)";
}

/**
 * Toggles the beer brands and types in the search variables as the user selects/deselects them.
 *
 * @param {HTMLElement} li The list item that was clicked.
 * @param {Object} searchVars The search variables -object.
 */
function toggleInSearch(li, searchVars) {
	const parentID = li.parentElement.id;
	const text = li.textContent || li.innerText;
	li.classList.toggle("selected");
	if(parentID == "brands") {
		if (searchVars.brands.indexOf(text) >= 0) {
			searchVars.brands.splice(searchVars.brands.indexOf(text), 1);	
		} else {
			searchVars.brands.push(text);
		}
	} else if(parentID == "types") {
		if (searchVars.types.indexOf(text) >= 0) {
			searchVars.types.splice(searchVars.types.indexOf(text), 1);
		} else {
			searchVars.types.push(text);
		}
	}
}

function toggleServing(el) {
	const clicked = el.classList.contains('serving-button') ? el : el.parentElement;
	console.log(clicked);
	const parentElement = clicked.parentElement;
	const buttons = parentElement.querySelectorAll('.serving-button');
	buttons.forEach((button) => {
		if(button === clicked) {
			button.classList.add('serving-button-active');
		} else {
			button.classList.remove('serving-button-active');
		}		
	})
	return clicked.id;
}


/**
 * Resizes the map, menu and restaurant card heights when the window is resized.
 *
 */
function resizeElementHeights() {
	const windowHeight = window.innerHeight;
	const headerHeight = document.querySelector('header').clientHeight;
	const routeHeight = document.getElementById('route-container').clientHeight;
	const mapHeight = routeHeight > 0 ? (windowHeight - headerHeight - routeHeight) : (windowHeight - headerHeight); 
	document.getElementById("side-menu").style.height = windowHeight + "px";
	document.getElementById("restaurant-card").style.height = windowHeight + "px";
	document.getElementById("map").style.height = mapHeight + "px";
}

/**
 * Capitalizes the first letter of the given string.
 *
 * @param {string} string The string to be capitalized.
 * @returns {String} The inputted string with a capitalized first letter.
 */
function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Removes duplicates from the given list.
 *
 * @param {list} array The list where the duplicates should be removed from.
 * @returns {list} The same list without duplicates.
 */
function removeDuplicates(array) {
	return array.filter(function(element, position, arr) {
		return arr.indexOf(element) == position;
	});
}

/**
 * Opens the beer brand and beer type lists in the menu when they are clicked.
 *
 * @param {HTMLElement} item The list element that should be made visible.
 */
function toggleVisible(item){
	if (item.style.height === "195px"){
		item.style.height = "0px";
	}else{
		item.style.height = "195px";
	}
}

/**
 * Rotates the given element.
 *
 * @param {HTMLElement} icon The element that needs to be rotated.
 */
function rotateIcon(icon) {
	if (icon.style.transform === "rotate(0deg)") {
		icon.style.transform = "rotate(-90deg)";
	} else {
		icon.style.transform = "rotate(0deg)";
	}
}

/**
 * Opens the menu element and the "out of focus" element behind it.
 *
 */
function openMenu() {
	document.getElementById("side-menu").style.left = "0px";
	document.getElementById("oof").style.width = "100%";
}

/**
 * Closes the menu element and the "out of focus" element behind it.
 *
 */
function closeMenu() {
	document.getElementById("side-menu").style.left = "-300px";
	document.getElementById("oof").style.width = "0";
}

/**
 * Opens the restaurant card element and the "out of focus" element behind it.
 *
 */
function openCard() {
	document.getElementById("restaurant-card").style.right = "0";
	document.getElementById("oof").style.width = "100%";    
	document.getElementById("bar-photo").style.backgroundImage = "url('kgps_icons/beer-load.gif')";
	document.getElementById("bar-photo").style.backgroundSize = "150px";
}

/**
 * Closes the restaurant card element and the "out of focus" element behind it.
 *
 */
function closeCard() {
	document.getElementById("restaurant-card").style.right = window.innerWidth <= 600 ? "-100%" : "-600px";
	document.getElementById("oof").style.width = "0";
}

/**
 * Closes the directions to the selected bar.
 *
 */
function closeDirections() {
	const windowHeight = window.innerHeight;
	const headerHeight = document.getElementsByTagName("header")[0].clientHeight;
	const mapHeight = windowHeight - headerHeight + "px";
	const directionsHeight = 0 + "px";
	document.getElementById("map").style.height = mapHeight;
	document.getElementById("route").style.height = directionsHeight;
	document.getElementById("search-container").style.display = "block";
}

// näyttää käyttöohjeet ellei käyttäjä ole valinnut toisin
function showModal() {
	const noShow = localStorage.getItem("noMoreInstructions");
	if(noShow) return;
	const modal = document.getElementById("modal");
	const oof = document.getElementById("oof");
	oof.style.width = "100%";
	modal.classList.add("visible");
	
}

// sulkee modalin
function hideModal() {
	const modal = document.getElementById("modal");
	const oof = document.getElementById("oof");
	const checkbox = document.querySelector("input[name='noMoreInstructions'");
	modal.classList.remove("visible");
	oof.style.width = 0+"px";
	if(checkbox.checked) {
		localStorage.setItem("noMoreInstructions", true);
	}
}

/**
 * Adds the restaurants name, address, open hours for the current day and a photo of the bar from google.
 * 
 * @param {Object} place The bar object from Google's search.
 *
 */
function renderBarInfo(place) {
	const date = new Date();
	const language = window.localStorage.getItem("language") === "en" ? "en" : "fi";
	const weekday = date.getDay() > 0 ? date.getDay()-1 : 6;
	const barAddress = document.getElementById("bar-address");
	const barName = document.getElementById("bar-name");
	const barOpen = document.getElementById("bar-open");
	const barPhoto = document.getElementById("bar-photo");
	const service = new google.maps.places.PlacesService(map);
	const response = getBarData(place.name);
	response.then(data => {
		console.log(data);
		const body = document.querySelector("tbody");
		if(data.length === 0){
			body.textContent = "Ei listatietoja saatavilla.";
			body.classList.add("emptyTable");
		} else {
			body.classList.remove("emptyTable");
			createBeerTableBody(data);
			updateTable(data.sort(sortBy("name", true)), language);
		}	
		beerList = data;	
	});
	barName.innerHTML = place.name;
	setRating(place.rating);
	
	service.getDetails({
		placeId: place.place_id
	}, function(data, status) {
		if (status === google.maps.places.PlacesServiceStatus.OK) {
			const address = data.formatted_address;
			const url = data.photos[0].getUrl({ "maxWidth": 600 });
			barAddress.innerHTML = address.split(",",2).join(); 
			barOpen.innerHTML = capitalizeFirstLetter(data.opening_hours.weekday_text[weekday]);	
			barPhoto.style.backgroundSize = "cover";
			barPhoto.style.backgroundImage = "url("+url+")";
		}
	});
	
}

/**
 * Sets the bar's google rating as beer pints into the restaurant card for the selected bar.
 * 
 * @param {number} rating The bar's rating on Google. (0-5)
 *
 */
function setRating(rating) {
	let rounded = Math.round(rating);
	let html = "";
	for(var i=1;i<=5;i++) {
		if(i<=rating) {
			html += "<img class=\"rating-icon\" src=\"kgps_icons/pint-rating.svg\">";
		} else {
			html += "<img class=\"rating-icon\" src=\"kgps_icons/pint-rating-bw.svg\">";
		}
	}
	document.getElementById("rating").innerHTML = html;
};

/**
 * Converts the static content Finnish <-> English based on the saved locale.
 * The Finnish and English texts are from the locale JSON files.
 * 
 * @param {string} language The language that was saved in local storage.
 *
 */
function localizeContent(language) {
	const locale = language === "en" ? en_GB : fi_FI;
	document.getElementById("tapButtonText").textContent = locale.menu.searchOptionButtons.tapButton;
	document.getElementById("bothButtonText").textContent = locale.menu.searchOptionButtons.bothButton;
	document.getElementById("bottleButtonText").textContent = locale.menu.searchOptionButtons.bottleButton;
	document.getElementById("priceText").textContent = locale.menu.searchOptionSliders.priceText;
	document.getElementById("abvText").textContent = locale.menu.searchOptionSliders.abvText;
	document.getElementById("distanceText").textContent = locale.menu.searchOptionSliders.distanceText;
	document.getElementById("brandListText").textContent = locale.menu.listsContainer.brandListText;
	document.getElementById("typeListText").textContent = locale.menu.listsContainer.typeListText;
	document.querySelector(".button-cancel").textContent = locale.menu.menuButtons.buttonCancel;
	document.querySelector(".button-submit").textContent = locale.menu.menuButtons.buttonSubmit;
	document.getElementById("searchbox").placeholder = locale.searchContainer.searchbox;
	document.querySelector("#walking img").alt = locale.restaurantCard.directionsButtons.walk;
	document.querySelector("#walking img").title = locale.restaurantCard.directionsButtons.walk;
	document.querySelector("#driving img").alt = locale.restaurantCard.directionsButtons.drive;
	document.querySelector("#driving img").title = locale.restaurantCard.directionsButtons.drive;
	document.querySelector("#transit img").alt = locale.restaurantCard.directionsButtons.transit;
	document.querySelector("#transit img").title = locale.restaurantCard.directionsButtons.transit;
	document.querySelector("#bicycling img").alt = locale.restaurantCard.directionsButtons.bicycle;
	document.querySelector("#bicycling img").title = locale.restaurantCard.directionsButtons.bicycle;
}

/**
 * Helperfunction. Mainly to control the window resize function's callback function.
 * Stolen from {@link https://davidwalsh.name/javascript-debounce-function|David Walsh}
 * 
 * @param {function} func The function to be called.
 * @param {number} wait Time in milliseconds between each time the function is fired.
 * @param {boolean} immediate Should be function be triggered on the leading edge or the trailing edge. 
 * 
 * @returns {function} func Returns a new anonymous version of the same function and fires it as long as the function is triggered.
 *
 */
function debounce(func, wait, immediate) {
	let timeout = null;
	return function() {
		const context = this, args = arguments;
		const later = function() {
			if (!immediate) func.apply(context, args);
		};
		const callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) {
			func.apply(context, args);
		}
	};
}


// ----- TÄSTÄ ALASPÄIN VAIN KARTTAAN LIITTYVIÄ FUNKTIOITA ----

/**
 * Initializes the map after the google maps API script has loaded.
 *
 */
function initMap() {
	map = new google.maps.Map(document.getElementById("map"), {
		center: {lat: 60.162786, lng: 24.932607},
		zoom: 14,
		gestureHandling: "greedy",
		styles: [
			{
				"featureType": "poi",
				"elementType": "labels.text",
				"stylers": [
					{
						"visibility": "off"
					}
				]
			},
			{
				"featureType": "poi.business",
				"stylers": [
					{
						"visibility": "off"
					}
				]
			},
			{
				"featureType": "road",
				"elementType": "labels.icon",
				"stylers": [
					{
						"visibility": "off"
					}
				]
			}
		]
	});
}

/**
 * Google geolocation.
 * Locates the user and searches for the nearby bars within the given distance if geolocation is enabled/available.
 * @see searchNearby
 * @param {number} distance The distance from the menu's distance slider.
 * @param {Object} infowindow The small pop-up info that is showed when the user clicks the yellow marker (which is placed at the address that the user searched). 
 *
 */
function locateUser(distance, infowindow) {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			pos = {
				lat: position.coords.latitude,
				lng: position.coords.longitude
			};
			if(pos != null) {
				map.setCenter(pos);
				const image = "kgps_icons/yellow-marker.png";
				const marker = new google.maps.Marker({
					map: map,
					position: pos,
					icon : image,
				});
				markers.push(marker);
				searchNearby(pos, distance);
			}
		}, function() {
			handleLocationError(true, infowindow, map.getCenter());
		});
	} else {
		// Selain ei tue geolokaatiota
		handleLocationError(false, infowindow, map.getCenter());
	}
}

/**
 * Google geocoder.
 * If the search result is a place that has "bar" or "night_club" tag on google -> only that place's marker is shown on the map.
 * Otherwise there is a yellow marker at the location and the nearby area is searched for bars with the selected search parameters from the menu. 
 * @see searchNearby
 * @param {string} address The address/place that the user searched.
 * @param {number} distance The range of the search in meters.
 * @param {Object} infowindow The small pop-up info that is showed when the user clicks the yellow marker (which is placed at the address that the user searched). 
 *
 */
function geocodeAddress(address, distance, infowindow) {
	const geocoder = new google.maps.Geocoder();
	const image = "kgps_icons/yellow-marker.png";
	geocoder.geocode(
		{"address": address,
			componentRestrictions: {
				country: "FI"
			}}, function(results, status) {
			if (status == "OK") {
				const searchPos = results[0].geometry.location;
				map.setCenter(searchPos);
				
				// jos etsitty paikka on baari/yökerho -> näyttää vain sen markerin, muuten etsii baarit lähistöltä normaalisti
				if (results[0].types.filter(type => type === "bar" || type === "night_club").length > 0) {
					searchNearby(searchPos, 1);
				} else {
					searchNearby(searchPos, distance);
					const image = "kgps_icons/yellow-marker.png";
					const marker = new google.maps.Marker({
						map: map,
						position: searchPos,
						icon : image,
					});
					markers.push(marker);
					infowindow.setContent(results[0].formatted_address);
					google.maps.event.addListener(marker, "click", function() {
						infowindow.open(map, marker);
					}); 
				}
			} else {
				alert("Paikannus ei onnistunut: " + status);
			}
		});
}

/**
 * Google navigator.
 * Calculates the route from the user location to the selected bar using the transport that the user clicked and opens the element with the directions. 
 * @param {Object} directionsService Google directions service.
 * @param {Object} directionsRenderer Google directions renderer.
 * @param {Object} endPoint The coordinates of the bar. Latitude, longitude.
 * @param {string} mode The transport mode that was chosen (walk/drive/bike/public transport). 
 *
 */
function calcRoute(directionsService, directionsRenderer, endPoint, mode) {
	if (pos === undefined && navigator.geolocation) {
  		navigator.geolocation.getCurrentPosition(function(position) {
	        pos = {
	          	lat: position.coords.latitude,
	          	lng: position.coords.longitude
	        };
    	});
    };
    directionsRenderer.setMap(map);
	directionsService.route({
		origin: pos,
		destination: endPoint,
		travelMode: mode,
		transitOptions: {
			modes: ["BUS", "RAIL"],
			routingPreference: "FEWER_TRANSFERS"
		},
		drivingOptions: {
			departureTime: new Date(Date.now()),
			trafficModel: "bestguess"
		},
		provideRouteAlternatives: true,
		region: "FI"
	}, function(response, status) {
		if (status === "OK") {
			directionsRenderer.setDirections(response);
			const windowHeight = window.innerHeight;
			document.getElementById('route-container').style.height = windowHeight * 0.3 + "px";
			document.getElementById('search-container').style.display = "none";
			const marker = new google.maps.Marker({
				map: map,
				position: endPoint,
			});
			markers.push(marker);
			resizeElementHeights();
			closeCard();
		} else {
			window.alert("Reittioheiden hakeminen ei onnistunut: " + status);
		}
	});
}

/**
 * Google places service - nearby search.
 * Searches up to 60 bars and 60 night clubs from the given location and within the given distance.
 * @param {Object} loc The location object, which has latitude and longitude.
 * @param {number} distance The range for the search in meters. 
 *
 */
function searchNearby(loc, distance) {
	const service = new google.maps.places.PlacesService(map);
	service.nearbySearch({
		location: loc, 
		radius: distance,
		type: ["night_club"]
	}, processResults);	

	service.nearbySearch({
		location: loc, 
		radius: distance,
		type: ["bar"]
	}, processResults);	
}

/**
 * Processes the results of the searchNearby-method and places a marker on the map for each bar.
 * @see searchNearby
 * @param {Object[]} results The results of the Google search.
 * @param {Object} status The status of the Google search.
 * @param {Object} pagination The search only shows 20 results per page so with the pagination
 *  we can get up to 60 results instead of the default 20 (Google's max is 3 pages).
 *
 */
function processResults(results, status, pagination) {
	if (status === google.maps.places.PlacesServiceStatus.OK) {
		if (pagination.hasNextPage) {
			pagination.nextPage();
		}
		for (var i = 0; i < results.length; i++) {
			setTimeout((function(i){
				return function(){
					createMarker(results[i]);
				};
			})(i),100*i);
		}
	}
}

/**
 * Creates a marker at the given place's location and adds a Google eventlistener for it.
 * Clicking the marker updates the restaurant card to show the selected bar and opens the restaurant card.
 * @see renderBarInfo
 * @see openCard
 * @param {Object} place The place object from a Google search.
 *
 */
function createMarker(place) {
	var marker = new google.maps.Marker({
		map: map,
		position: place.geometry.location,
		animation: google.maps.Animation.DROP,
		//icon: "kgps_icons/favicon-32x32.png",
	});
	markers.push(marker);
	google.maps.event.addListener(marker, "click", function() {
		renderBarInfo(place);
		openCard();
	});
}

/**
 * Clears all markers from the map.
 */
function clearMarkers() {
	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(null);
	}
	markers = [];
}

// googlen oma error funktio
function handleLocationError(browserHasGeolocation, infowindow, pos) {
	infowindow.setPosition(pos);
	infowindow.setContent(browserHasGeolocation ?
		"Error: Paikannus epäonnistui." :
		"Error: Selaimesi ei tue paikannusta.");
	infowindow.open(map);
}

function loadScript(url, callback) {
	const script = document.createElement("script")
	script.type = "text/javascript";
	if (script.readyState) {  //IE
		script.onreadystatechange = function() {
			if (script.readyState === "loaded" || script.readyState === "complete") {
				script.onreadystatechange = null;
				callback();
			}
		};
	} else {  //Others
		script.onload = function() {
			callback();
		};
	}
	script.src = window.localStorage.getItem("language") === "en" ? 
		"https://maps.googleapis.com/maps/api/js?key=AIzaSyDuIpE10xbisU_de-Mg_xR4-OpmOVl3BxA&libraries=places&language=en&region=FI"
		: "https://maps.googleapis.com/maps/api/js?key=AIzaSyDuIpE10xbisU_de-Mg_xR4-OpmOVl3BxA&libraries=places&language=fi&region=FI";
	document.getElementsByTagName("head")[0].appendChild(script);
}