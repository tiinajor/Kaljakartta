/*
TODO LISTA:
- käyttöohjeet
- searchNearby ei poista duplikaatteja (eli marker osalle baareista tulee kahteen kertaan)
- error tilanteiden ilmoitukset käyttäjälle
- loading palkki vain hakukriteerien kanssa
- tyhjennä nappi
- menun elementit järjestykseen
- 
*/

(function (window, document, noUiSlider, undefined) {

	/**
	 * Has list for map markers, list for bars that match the searchVars and the list of beers that a bar has.
	 * @type {object}
	 */
	const globalLists = {
		markers : [],
		bars : [],
		beerList : []
	}

	/**
	 * Object which contains all google variables and services.
	 * @type {object}
	*/
	const googleshit = {
		map: null,
		directionsService: null,
		directionsRenderer: null,
		geocoder: null,
		placesService: null,
		infowindow: null,
		circle: null
	};

	/**
	 * Object which contains helper variables for search and displaying the directions markers.
	 * @type {object}
	*/
	const globalVars = {
		searchWithVars: false,
		lastSearch: '',
		clickedPlace: null,
		language: window.localStorage.getItem("language") || "fi",
		selectedBrands: 0,
		selectedTypes: 0
	}
	const k18yes = document.querySelector('.button-yes');
	const k18no = document.querySelector('.button-no');
	const fiFlag = document.getElementById("fi");
	const enFlag = document.getElementById("en");
	const title = document.querySelector(".title");
	const typeList = document.querySelector("#type-list div");
	const brandList = document.querySelector("#brand-list div");
	const menuButton = document.getElementById("hamburger-menu");
	const locateButton = document.getElementById('locate');
	const menuSearchButton = document.querySelector('.button-submit');
	const menuCloseButton = document.getElementById("menu-close-x");
	const cardCloseButton = document.getElementById("card-close-x");
	const modalCloseButton = document.getElementById("modal-close-x");
	const routeCloseButton = document.getElementById("route-close-x");
	const tutorialModal = document.getElementById("tutorial");
	const k18Modal = document.getElementById("k18");
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
	const tableHeads = document.getElementsByTagName('th');
	const servingButtons = document.querySelectorAll('.serving-button');
	const routeContainer = document.getElementById('route-container');
	const searchContainer = document.getElementById('search-container');
	const modalFlag = document.querySelector('#tutorial .flag');
	const searchbox = document.getElementById("searchbox");
	const menuSearchbox = document.getElementById("menu-searchbox");
	const searchButton = document.getElementById("search-button");
	const brandsCounterElement = document.getElementById('selectedBrands');
	const typesCounterElement = document.getElementById('selectedTypes');
	let headerHeight = headerElement.clientHeight;
	let windowHeight = window.innerHeight;
	let mouseDown = false;
	let mouseStartPos;
	let handleOffset;
	let directionsMaxHeight;
	let mapMinHeight;
	//beertable sorting order per column
	const sortAscending = {
		serving: false,
		type: false,
		name: false,
		vol: false,
		abv: false,
		price: false
	}

	const searchVars = {
		serving : "Both",
		price : 25,
		abvMin : 0,
		abvMax : 12,
		brands : [],
		types : []
	};

	loadScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyDuIpE10xbisU_de-Mg_xR4-OpmOVl3BxA&libraries=places&language=fi&region=FI", initMap);

	showK18();
	localizeContent(globalVars.language);
	createBeerTable(globalVars.language);

	// tap-bottle-both
	Array.from(servingButtons).forEach((e) => e.addEventListener("click", (e) => searchVars.serving = toggleServing(e.target)));

	// olutlistan "otsikoiden" klikkaaminen järjestää listan kyseisen sarakkeen mukaan
	Array.from(tableHeads).forEach((element) => element.addEventListener("click", () => tableColumnSorting(element)));

	// lisää alpha-teksin headeriin, ei tule lopulliseen versioon
	title.innerHTML += ("<sup class='version'>alpha</sup>");

	// kaljakartta -teksti lataa sivun uudestaan
	title.addEventListener("click", () => {window.location.reload(true)});

	// lippujen klikkaaminen vaihtaa sivuston kielen kyseiseen kieleen
	fiFlag.addEventListener("click", (e) => swapLanguage(e.target.id));
	enFlag.addEventListener("click", (e) => swapLanguage(e.target.id));
	modalFlag.addEventListener("click", () => {
		const newLanguage = window.localStorage.getItem('language') === "en" ? "fi" : "en";
		swapLanguage(newLanguage);
	});

	k18no.addEventListener('click', () => window.close());
	k18yes.addEventListener('click', () => {
		sessionStorage.setItem('checkedAge', true);
		closeK18();
		showTutorial();
	});



	// asettaa kartan, menun, reittiohjeiden sekä baarikortin korkeuden ja korjaa niitä aina kun ikkunan koko muuttuu
	resizeElementHeights();
	window.addEventListener("resize", debounce(resizeElementHeights,100,false));

	// kartan päällä olevan hakukentän suurennuslasi etsii osoitteen mukaan baarit jos osoite ei ole tyhjä
	searchButton.addEventListener("click", function() {
		const address = searchbox.value;
		if(address !== "") {
			const distance = distanceSlider.noUiSlider.get();
			globalVars.searchWithVars = false;
			textSearch(address, distance);
			globalVars.lastSearch = address;
			searchbox.value = "";
		}
	});

	// hakukentässä enterin painaminen käynnistää haun
	searchbox.addEventListener("keyup", function(e) {
		e.preventDefault();
		const input = e.target;
		const address = input.value;
		if(e.keyCode === 13 && address !== ""){
			const distance = distanceSlider.noUiSlider.get();
			globalVars.searchWithVars = false;
			textSearch(address, distance);
			globalVars.lastSearch = address;
			this.value = "";
		}
	});

	// menun hakukentässä enterin painaminen käynnistää haun
	menuSearchbox.addEventListener("keyup", function(e) {
		e.preventDefault();
		if(e.keyCode === 13) {
			globalVars.searchWithVars = true;
			searchWithVars("http://188.166.162.144:130/findrestaurants", searchVars, distanceSlider.noUiSlider.get());
			globalVars.lastSearch = this.value;
		}
	});

	// avaa merkit-listan ja sulkee muut listat
	brandList.addEventListener("click", function() {
		let ul = document.getElementById("brands");
		let icon = this.querySelector('img');
		toggleVisible(ul);
		rotateIcon(icon);
		closeList(document.getElementById("type-list"));
	});

	// avaa oluttyypit-listan ja sulkee muut listat
	typeList.addEventListener("click", function() {
		let ul = document.getElementById("types");
		let icon = this.querySelector('img');
		toggleVisible(ul);
		rotateIcon(icon);
		closeList(document.getElementById("brand-list"));
	});

	// menun avaus
	menuButton.addEventListener("click", openMenu);

	// hakee menuun oluttyypit
	fetch("http://188.166.162.144:130/beveragetypes")
		.then(response => { return response.text() })
		.then(data => {
			console.log(data);
			let beerTypes = data.slice(1, -1).split(",");
			beerTypes = beerTypes.map(x => x.trim());
			createList(beerTypes, document.getElementById("type-list"), "types");
			
			console.log("beertypes loaded");
		})
		.catch(err => console.log("Fetch Error: " + err));

	// hakee menuun olutmerkit
	setTimeout(() => {
		fetch("http://188.166.162.144:130/brands")
			.then(response => {
				return response.text();
			})
			.then(data => {
				let beerBrands = data.slice(1, -1).split(",");
				beerBrands = beerBrands.map(x => x.trim());
				createList(beerBrands, document.getElementById("brand-list"), "brands");
				console.log("beer brands loaded");
			})
			.catch(err => console.log("Fetch Error: " + err));
	}, 750);

	// käyttäjän GPS paikannus
	locateButton.addEventListener('click', () => {
		routeContainer.style.height = 0+"px";
		searchContainer.style.position = "absolute";
		resizeElementHeights();
		clearMarkers();
		googleshit.directionsRenderer.setMap(null);
		globalVars.searchWithVars = false;
		const distance = distanceSlider.noUiSlider.get();
		locateUser(distance)
			.then(pos => {
				if (pos != null) {
					googleshit.map.panTo(pos);
					createMarker(pos, true, false);
					globalLists.bars = globalLists.bars.map(name => capitalizeEveryWord(name));
					searchNearby(pos, distance);
				}
			})
			.catch(error => console.log("locateUserError: " + error));
	});

	// hae-nappi hakee baarit, joista löytyy hakukriteereitä vastaavia juomia
	menuSearchButton.addEventListener('click', () => {
		globalVars.searchWithVars = true;
		searchWithVars("http://188.166.162.144:130/findrestaurants", distanceSlider.noUiSlider.get());
		globalvars.lastSearch = menuSearchbox.value;
	});

	// menun sulkeminen
	menuCloseButton.addEventListener("click", closeMenu);

	// "restaurant cardin" sulkeminen
	cardCloseButton.addEventListener("click", closeCard);

	// modaalin sulkeminen
	modalCloseButton.addEventListener("click", closeTutorial);

	// reittiohjeen sulkeminen
	routeCloseButton.addEventListener("click", closeDirections);

	// out of focus alueen klikkaaminen sulkee kaikki
	oof.addEventListener("click", (e) => closeAll(e.target));

	// reittioheiden koon muuttaminen koneella
	handle.addEventListener('mousedown', (e) => directionsReziseStart(e));
	window.addEventListener("mouseleave", () => mouseDown = false);
	window.addEventListener("mouseup", () => mouseDown = false);
	window.addEventListener("mousemove", (e) => directionsResize(e));

	//reittiohjeiden koon muuttaminen mobiilissa
	handle.addEventListener("touchstart", (e) => directionsReziseStart(e));
	window.addEventListener("touchend", () => mouseDown = false);
	window.addEventListener("touchcancel", () => mouseDown = false);
	window.addEventListener("touchmove", (e) => directionsResize());

	// menun voi avata pyyhkäisemällä vasemmasta reunasta
	mapElement.addEventListener("touchstart", (e) => {
		const startFromLeftEdge = e.changedTouches[0].pageX < 25;
		googleshit.map.setOptions({ draggable: !startFromLeftEdge});
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
	Array.from(directionsButtons).forEach((el) => el.addEventListener("click", function() {
		const endPoint = document.getElementById("bar-address").textContent;
		const barName = document.getElementById("bar-name").textContent;
		const mode = el.id.toUpperCase();
		googleshit.circle.setOptions({fillOpacity: 0, strokeOpacity: 0});
		defineStartingPoint()
			.then(startPoint => {
				calcRoute(startPoint,endPoint,mode);
			})
			.catch(error => showErrorMessage("directionsError: " + error));

	}));

	//slaiderien luonti
	noUiSlider.create(priceSlider, {
		start: 25,
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
		start: [ 0, 12 ],
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
		start: 1000,
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
	priceSlider.noUiSlider.on("change", (value) => updatePrice(value[0]));
	alcoholSlider.noUiSlider.on("change", (values) => updateAbv(values));


/**
 * When the user clicks on the black bar on the directions element, mapMinHeight and directionsMaxHeight are calculated.
 * @see directionsResize
 * @param {event} e The click/touch event.
 *
 */
function directionsReziseStart(e) {
	const x = e.pageX || e.touches.pageX;
	const y = e.pageY || e.touches.pageY;
	mouseDown = true;
	handleOffset = y - handle.getBoundingClientRect().top;
	const routeOptionsHeight = document.querySelector('.adp-list') != null ? document.querySelector('.adp-list').clientHeight : 0;
	directionsMaxHeight = document.querySelector('.adp').clientHeight  + routeOptionsHeight + 24;
	mapMinHeight = windowHeight - headerHeight - directionsMaxHeight;
}

/**
 * Changes the size of the directions element while the user has their mouse/finger pressed down.
 * @see directionsResizeStart
 * @param {event} e The click/touch event.
 */
function directionsResize(e) {
	if(!mouseDown) return;
	e.preventDefault();
	const y = e.pageY || e.touches.pageY;
	const handleTopPos = y - handleOffset;
	const directionsHeight = windowHeight - handleTopPos;
	const mapHeight = windowHeight - directionsHeight - headerHeight;
	mapElement.style.height = (mapHeight > mapMinHeight) ? mapHeight + "px" : mapMinHeight + "px";
	setTimeout(() => {
		routeContainer.style.height = (directionsHeight < directionsMaxHeight) ? directionsHeight + "px" : directionsMaxHeight + "px";
	}, 150);
}


/**
 * Updates the price in the search parameters.
 * @param {string} value The new price.
 *
 */
function updatePrice(value) {
	searchVars.price = parseFloat(value);
}

/**
 * Updates the abv min and max values in the search parameters.
 * @param {list} values A list of the new values.
 *
 */
function updateAbv(values) {
	searchVars.abvMin = parseFloat(values[0]);
	searchVars.abvMax = parseFloat(values[1]);
}

/**
 * Creates the thead and an empty tbody to ".beers-table" element in the restaurant card. Table head values are set in Finnish/English based on the parameter value.
 * @param {string} language The language (fi/en) of the content.
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
function createBeerTableBody(beers) {
	const tableBody = document.querySelector("tbody");
	let html = "";
	for(let i=0;i<beers.length;i++) {
		const beer = beers[i];
		const name = capitalize(beer.name);
		const type = capitalize(beer.type);
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
 * @param {string} language The beertype column is in this language.
 */
function updateTable(beers, language) {
	const rows = document.querySelector("tbody").rows;
	const bottleIcon = "kgps_icons/beer-bottle.svg";
	const tapIcon = "kgps_icons/beer-tap.svg";
	for(let i = 0; i < beers.length; i++){
		const icon = beers[i].serving === "tap" ? tapIcon : bottleIcon;
		const vol = beers[i].vol === Number.MAX_VALUE ? "?" : beers[i].vol + "l";
		const abv = beers[i].abv === Number.MAX_VALUE ? "?" : beers[i].abv + "%";
		const price = beers[i].price === Number.MAX_VALUE ? "?" : beers[i].price + "€";

		let beerType = "?";
		if(beers[i].type !== Number.MAX_VALUE) {
			const typeLocales = (beers[i].type.indexOf(",") > 0) ? beers[i].type.split(",") : beers[i].type;
			if(typeof(typeLocales) === "object") {
				beerType = language === "fi" ? typeLocales[0] : typeLocales[1];
			} else {
				beerType = typeLocales;
			}
		}
		rows[i].cells[0].innerHTML = `<img src=${icon}>`;
		rows[i].cells[1].textContent = capitalize(beers[i].name);
		rows[i].cells[2].textContent = capitalize(beerType);
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
		if(typeof x === "string" && typeof y === "string") {
			return ascendingOrder ? x.localeCompare(y) : y.localeCompare(x);
		} else {
			return ascendingOrder ? (parseFloat(x) - parseFloat(y)) : (parseFloat(y) - parseFloat(x));
		}
	};
}

/**
 * Capitalizes the first letter of the given string.
 *
 * @param {string} string The string to be capitalized.
 * @returns {String} The inputted string with a capitalized first letter.
 */
function capitalize(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Capitalizes the first letter of every word in the given text.
 *
 * @param {string} text The text where every word needs to be capitalized.
 * @returns {String} The same text with every word capitalized.
 */
function capitalizeEveryWord(text) {
	const words = text.toLowerCase().split(' ');
	for (let i = 0; i < words.length; i++) {
		words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
	}
	return words.join(' ').trim();
}

/**
 * Gets the beerlist of the given bar from our API.
 * @param {String} barName The name of the bar that you need the beerlist for.
 * @returns {Object} Returns the beerlist as a JSON or return null if the request status is 500.
 */
function getBarData(barName) {
	const url = "http://188.166.162.144:130/restaurant?name=" + barName.toLowerCase();
	return fetch(url).then(response => response.status !== 500 ? response.json() : null).catch(error => showErrorMessage("getBarDataError: " + error));
}

/**
 * Sends a post request to the url using fetch API and sends the data as the request body.
 * If the menu searchbox is empty -> locates the user and searches that location with the searchVars.
 * If the menu searchbox has text in it -> geolocates the address and does the search there.
 *
 * @param {string} url The url where the request is sent.
 * @param {*} data The data which will be sent in the request.
 * @param {number} distance The max range from the address where the bars will be searched.
 */
function searchWithVars(url, data, distance) {
	fetch("https://cors-anywhere.herokuapp.com/"+url, {
		method: "POST",
		body: JSON.stringify(data),
		headers: { "content-type": "application/json" },
	})
	.then(response => {
		if (response.ok) {
			console.log('Status: ' + response.statusText);
		} else {
			console.log('Request failed. Returned status of ' + response.status);
		}
		return response.json();
	})
	.then(data => {
		globalLists.bars = data;
		routeContainer.style.height = 0 + "px";
		searchContainer.style.position = "absolute";
		resizeElementHeights();
		clearMarkers();
		googleshit.directionsRenderer.setMap(null);
		globalLists.bars = globalLists.bars.map(name => capitalizeEveryWord(name));
		if(menuSearchbox.value === "") {
			locateUser(distance)
			.then(pos => {
				googleshit.map.panTo(pos);
				createMarker(pos, true, false);
				searchNearby(pos, distance);
			})
			.catch(error => showErrorMessage("locateUserError: " + error));
		} else {
			textSearch(menuSearchbox.value, distance);
			menuSearchbox.value = "";
		}
		closeMenu();
	})
	.catch(error => showErrorMessage("searchWithVarsError: " + error));
}


/**
 * Google geolocates the address, searches for bars within the distance and places marker for each bar on the map.
 * @param {string} address The address which the user typed to the search box on the map.
 * @param {number} distance The max range from the address where the bars will be searched.
 */
function textSearch(address, distance) {
	googleshit.directionsRenderer.setMap(null);
	clearMarkers();
	geocodeAddress(address)
	.then(results => {
		const searchPos = results[0].geometry.location;
		googleshit.map.panTo(searchPos);
		// jos etsitty paikka on baari/yökerho -> näyttää vain sen markerin, muuten etsii baarit lähistöltä normaalisti
		if (results[0].types.filter(type => type === "bar" || type === "night_club").length > 0) {
			searchNearby(searchPos, 1);
		} else {
			searchNearby(searchPos, distance);
			const marker = createMarker(searchPos, false, false);
			googleshit.infowindow.setContent(results[0].formatted_address);
			google.maps.event.addListener(marker, "click", function() {
				googleshit.infowindow.open(googleshit.map, marker);
			});
		}
	})
	.catch(error => showErrorMessage("textSearchError: " + error));
}

/**
 * Saves the websites language to localStorage so that the user's choice is saved even when the browser is closed.
 * @param {string} language The language to be saved in localStorage.
 */
function swapLanguage(language) {
	if(window.localStorage.getItem('language') !== language) {
		window.localStorage.setItem("language", language);
		window.location.reload();
	}
}

/**
 * Creates a list inside the given element in alphabetical order.
 *
 * @param {List} list The list of items to be inserted to the parent element.
 * @param {HTMLElement} parentDiv The parent element where the list will be created.
 * @param {string} id The ID that will be given to the list element.
 * @param {Object} searchVars An object which contains the search variables.
 */
function createList(list, parentDiv, id) {
	
	const ul = document.createElement("ul");
	ul.classList.add("dropdown-list");
	ul.id = id;
	for (let i = 0; i<list.length; i++) {
		list[i] = capitalize(list[i]);
	}

	if(id === "types") {
		let newList = [];
		const language = window.localStorage.getItem('language');

		for (let i = 0; i < list.length; i++) {
			const type = list[i] + "," + list[i+1];
			newList.push(type);
			i++;
		}
		newList = newList.sort();
		for (let i = 0; i<newList.length; i++) {
			const li = document.createElement("li");
			const beerTypes = newList[i]
							.split(",")
							.map(item => item.trim());
			const beerType = language === "fi" ? beerTypes[0] : beerTypes[1];
			const content = document.createTextNode(beerType);
			li.appendChild(content);
			li.dataset.type = newList[i];
			li.addEventListener("click", () => toggleInSearch(li, searchVars));
			ul.appendChild(li);
		}
	} else {
		list = removeDuplicates(list);
		list = list.sort();
		for (let i = 0; i < list.length; i++) {
			const li = document.createElement("li");
			const content = document.createTextNode(list[i]);
			li.appendChild(content);
			li.addEventListener("click", () => toggleInSearch(li, searchVars));
			ul.appendChild(li);
		}
	}
	parentDiv.appendChild(ul);
}

/**
 * Closes the given list.
 * @param {HTMLElement} div The div which contains the list element.
 */
function closeList(div) {
	const otherList = div.children[1];
	const otherDiv = div.children[0];
	const icon = otherDiv.querySelector('img');
	otherList.classList.remove('open');
	icon.style.transform = "rotate(-90deg)";
}

/**
 * Toggles the beer brands and types in the search variables as the user selects/deselects them.
 * @param {HTMLElement} li The list item that was clicked.
 */
function toggleInSearch(li) {
	const parentID = li.parentElement.id;
	li.classList.toggle("selected");
	if(parentID === "brands") {
		const text = li.textContent || li.innerText;
		const brands = searchVars.brands;
		if(brands.indexOf(text) >= 0) {
			brands.splice(brands.indexOf(text), 1);
			globalVars.selectedBrands--;
		} else {
			brands.push(text);
			globalVars.selectedBrands++;
		}
		brandsCounterElement.textContent = globalVars.selectedBrands === 0 ? "" : "(" + globalVars.selectedBrands + ")";
	}
	
	if(parentID === "types") {
		const text = li.dataset.type;
		const types = searchVars.types;
		if(types.indexOf(text) >= 0) {
			types.splice(types.indexOf(text), 1);
			globalVars.selectedTypes--;
		} else {
			types.push(text);
			globalVars.selectedTypes++;
		}
		typesCounterElement.textContent = globalVars.selectedTypes === 0 ? "" : "(" + globalVars.selectedTypes + ")";
	}
}

/**
 * Toggles the beer serving (tap-bottle-both) in the search variables when the buttons are clicked in menu.
 * @param {HTMLElement} el The element that was clicked.
 * @returns {string} The id of the clicked element.
 */
function toggleServing(el) {
	const clicked = el.classList.contains('serving-button') ? el : el.parentElement;
	const parentElement = clicked.parentElement;
	const buttons = parentElement.querySelectorAll('.serving-button');
	for(button of buttons) {
		if(button === clicked) {
			button.classList.add('serving-button-active');
		} else {
			button.classList.remove('serving-button-active');
		}
	}
	return clicked.id;
}


/**
 * Onclick function for table head cells. Sorts the beverage list by the clicked column.
 * @param {HTMLElement} el The table head cell that was clicked.
 */
function tableColumnSorting(el) {
	const column = el.getAttribute("data-id");
	const inactiveSortIcon = "kgps_icons/sort-icon-inactive.png";
	const ascSortIcon = "kgps_icons/sort-icon-ascend.png";
	const descSortIcon = "kgps_icons/sort-icon-descend.png";
	let sortedValues;
	let activeSortIcon;

	switch(column) {
	case "serving":
		sortAscending.serving = !sortAscending.serving;
		sortedValues = globalLists.beerList.sort(sortBy(column, sortAscending.serving));
		updateTable(sortedValues, globalVars.language);
		activeSortIcon = sortAscending.serving ? descSortIcon : ascSortIcon;
		break;
	case "name":
		sortAscending.name = !sortAscending.name;
		sortedValues = globalLists.beerList.sort(sortBy(column, sortAscending.name));
		updateTable(sortedValues, globalVars.language);
		activeSortIcon = sortAscending.name ? descSortIcon : ascSortIcon;
		break;
	case "type":
		sortAscending.type = !sortAscending.type;
		sortedValues = globalLists.beerList.sort(sortBy(column, sortAscending.type));
		updateTable(sortedValues, globalVars.language);
		activeSortIcon = sortAscending.type ? descSortIcon : ascSortIcon;
		break;
	case "abv":
		sortAscending.abv = !sortAscending.abv;
		sortedValues = globalLists.beerList.sort(sortBy(column, sortAscending.abv));
		updateTable(sortedValues, globalVars.language);
		activeSortIcon = sortAscending.abv ? descSortIcon : ascSortIcon;
		break;
	case "vol":
		sortAscending.vol = !sortAscending.vol;
		sortedValues = globalLists.beerList.sort(sortBy(column, sortAscending.vol));
		updateTable(sortedValues, globalVars.language);
		activeSortIcon = sortAscending.vol ? descSortIcon : ascSortIcon;
		break;
	case "price":
		sortAscending.price = !sortAscending.price;
		sortedValues = globalLists.beerList.sort(sortBy(column, sortAscending.price));
		updateTable(sortedValues, globalVars.language);
		activeSortIcon = sortAscending.price ? descSortIcon : ascSortIcon;
		break;
	default:
		break;
	}

	for (let i = 0; i < tableHeads.length; i++) {
		if (tableHeads[i].childNodes.length > 0) {
			tableHeads[i].childNodes[0].src = (tableHeads[i] === el) ? activeSortIcon : inactiveSortIcon;
		}
	}
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
	menuElement.style.height = windowHeight + "px";
	restaurantCard.style.height = windowHeight + "px";
	mapElement.style.height = mapHeight + "px";
}

/**
 * Removes duplicates from the given list/array.
 * @param {list} array The list where the duplicates should be removed from.
 * @returns {list} The same list without duplicates.
 */
function removeDuplicates(array) {
	return array.filter((element, index, arr) => {
		return arr.indexOf(element) === index;
	});
}

/**
 * Opens the beer brand and beer type lists in the menu when they are clicked.
 * @param {HTMLElement} item The list element that should be made visible.
 */
function toggleVisible(item){
	item.classList.toggle('open');
}

/**
 * Toggles the rotation of the given element between horizontal and vertical.
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
	menuElement.classList.add('visible');
	oof.classList.add('visible');
	menuSearchbox.value = capitalize(globalVars.lastSearch);
}

/**
 * Closes the menu element and the "out of focus" element behind it.
 *
 */
function closeMenu() {
	menuElement.classList.remove('visible');
	oof.classList.remove('visible');
}

/**
 * Opens the restaurant card element and the "out of focus" element behind it.
 *
 */
function openCard() {
	restaurantCard.classList.add('visible');
	oof.classList.add('visible');
	const photo = document.getElementById("bar-photo");
	photo.style.backgroundImage = "url('kgps_icons/beer-load.gif')";
	photo.style.backgroundSize = "150px";
}

/**
 * Closes the restaurant card element and the "out of focus" element behind it.
 *
 */
function closeCard() {
	restaurantCard.classList.remove('visible');
	oof.classList.remove('visible');
}


/**
 * Clicking the out-of-focus element closes the modal, menu and restaurant card unless the legal age checker is still on the screen.
 * @param {HTMLElement} clickedElement The element that was clicked.
 *
 */
function closeAll(clickedElement) {
	if(clickedElement !== oof || k18Modal.classList.contains('visible')) return;
	closeTutorial();
	closeCard();
	closeMenu();
}

/**
 * Closes the directions element.
 *
 */
function closeDirections() {
	googleshit.directionsRenderer.setMap(null);
	const windowHeight = window.innerHeight;
	const headerHeight = document.getElementsByTagName("header")[0].clientHeight;
	const mapHeight = windowHeight - headerHeight + "px";
	mapElement.style.height = mapHeight;
	routeContainer.style.height = 0 + "px";
	searchContainer.style.display = "block";
	resizeElementHeights();
}

/**
 * Opens the tutorial modal.
 *
 */
function showTutorial() {
	const noShow = localStorage.getItem("noMoreInstructions");
	if(noShow) return;
	oof.classList.add('visible');
	tutorialModal.classList.add("visible");
}

/**
 * Closes the tutorial modal and (if checked) saves the "show no more" option to local storage.
 *
 */
function closeTutorial() {
	const checkbox = document.querySelector("input[name='noMoreInstructions'");
	tutorialModal.classList.remove("visible");
	oof.classList.remove('visible');
	if(checkbox.checked) {
		localStorage.setItem("noMoreInstructions", true);
	}
}

/**
 * Opens the modal that asks if the user is over the legal drinking age.
 *
 */
function showK18() {
	const checkedAge = sessionStorage.getItem('checkedAge');
	if(checkedAge) return showTutorial();
	oof.classList.add('visible');
	map.classList.add('blur');
	searchContainer.classList.add('blur');
	headerElement.classList.add('blur');
	k18.classList.add('visible');
}

/**
 * Closes the modal that asked if the user is over the legal drinking age.
 *
 */
function closeK18() {
	oof.classList.remove('visible');
	map.classList.remove('blur');
	searchContainer.classList.remove('blur');
	headerElement.classList.remove('blur');
	k18.classList.remove('visible');
}

/**
 * Adds the restaurants name, address, open hours for the current day and a photo of the bar from google.
 * Gets the beverage list of the bar from our DB and shows it.
 * @param {Object} place The bar object from Google's search.
 *
 */
function renderBarInfo(place) {
	const date = new Date();
	const weekday = date.getDay() > 0 ? date.getDay()-1 : 6;
	const barAddress = document.getElementById("bar-address");
	const barName = document.getElementById("bar-name");
	const barOpen = document.getElementById("bar-open");
	const barPhoto = document.getElementById("bar-photo");
	getBarData(place.name)
		.then(data => {
			console.log(data);
			const body = document.querySelector("tbody");
			if(data.length === 0){
				body.textContent = "Ei listatietoja saatavilla.";
				body.classList.add("emptyTable");
			} else {
				body.classList.remove("emptyTable");
				createBeerTableBody(data);
				updateTable(data.sort(sortBy("name", true)), globalVars.language);
			}
			globalLists.beerList = data;
		})
		.catch(error => console.log("getbardata " + error));
	barName.innerHTML = place.name;
	setRating(place.rating);
	googleshit.placesService.getDetails({placeId: place.place_id},
		function(data, status) {
			if(status !== google.maps.places.PlacesServiceStatus.OK) return;
			const address = data.formatted_address;
			barAddress.innerHTML = address.split(",",2).join();
			barOpen.innerHTML = data.opening_hours ? capitalize(data.opening_hours.weekday_text[weekday]) : "Aukioloajat ei tiedossa";
			if(data.photos) {
				const url = data.photos[0].getUrl({ "maxWidth": 600 });
				barPhoto.style.backgroundSize = "cover";
				barPhoto.style.backgroundImage = "url(" + url + ")";
			}
		}
	);
}

/**
 * Sets the bar's google rating as beer pints into the restaurant card for the selected bar.
 * @param {number} rating The bar's rating on Google. (0-5)
 *
 */
function setRating(rating) {
	const rounded = Math.round(rating);
	let html = "";
	for(let i=1;i<=5;i++) {
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
 * @param {string} language The language for the content. For now only "fi" or "en".
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
	document.querySelector('#k18 h2').textContent = locale.k18.title;
	document.querySelector('.button-no').textContent = locale.k18.noBtn;
	document.querySelector('.button-yes').textContent = locale.k18.yesBtn;
	document.querySelector('.k18-body p').textContent = locale.k18.body;
	document.querySelector('#tutorial h2').textContent = locale.tutorial.title;
	document.querySelector('#tutorial .modal-body').textContent = locale.tutorial.body;
	document.querySelector('#tutorial label span').textContent = locale.tutorial.checkbox;
	modalFlag.src = locale.icon;
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
 * Initializes the map and all the Google services after the Google Maps API script has loaded.
 *
 */
function initMap() {
	googleshit.map = new google.maps.Map(document.getElementById("map"), {
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
	googleshit.placesService = new google.maps.places.PlacesService(googleshit.map);
	googleshit.directionsService = new google.maps.DirectionsService;
	googleshit.directionsRenderer = new google.maps.DirectionsRenderer({ suppressMarkers: true });
	googleshit.directionsRenderer.setPanel(document.getElementById("route"));
	googleshit.geocoder = new google.maps.Geocoder();
	googleshit.infowindow = new google.maps.InfoWindow();
	googleshit.circle = new google.maps.Circle({ map: googleshit.map });
}

/**
 * Google geolocation.
 * Locates the user and returns the coordinates.
 * Initially returns a promise and after the geolocation has finished it will resolve/reject the promise based on the geocoder's status.
 * @returns Initially returns a promise and after the geolocation has finished it will resolve/reject the promise based on the geocoder's status.
 */
function locateUser() {
	return new Promise((resolve, reject) => {
		if(navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(position => {
				resolve(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
			}, function() {
				reject("Paikannuksessa tapahtui virhe. Varmista, että paikannus on sallittu laitteesi asetuksissa.");
			})
		} else {
			reject("Selaimesi ei valitettavasti tue paikannusta.");
		}
	})
}


/**
 * Google geocoder.
 * Geocodes the given address into latitude and longitude coordinates.
 * Initially returns a promise and after the geocoder has finished it will resolve/reject the promise based on the geocoder's status.
 * @param {string} address The address/place that the user searched.
 * @returns {promise} Initially returns a promise and after the geocoder has finished it will resolve/reject the promise based on the geocoder's status.
 *
 */
function geocodeAddress(address) {
	return new Promise((resolve, reject) => {
		googleshit.geocoder.geocode(
			{
				"address": address,
				componentRestrictions: {
					country: "FI"
				}
			}, (results, status) => status === google.maps.GeocoderStatus.OK ? resolve(results) : reject(results));
	})
}

/**
 * If the user has made a text search for an address (map has a yellow marker) -> that will be the starting point.
 * Otherwise it will try to use geolocation to get the current location of the user.
 * @returns {promise} Initially returns a promise and after the starting point has been set it will resolve/reject the promise.
 * Throws an error if no yellow markers were on the map and geolocation fails.
 *
 */
function defineStartingPoint() {
	return new Promise((resolve, reject) => {
		let startPoint = null;
		for(marker of globalLists.markers) {
			if(marker.icon === "kgps_icons/yellow-marker.png") {
				startPoint = {
					lat: marker.position.lat(),
					lng: marker.position.lng()
				};
			}
		}
		if(startPoint === null) {
			locateUser()
				.then(start => resolve(start))
				.catch(error => reject(error));
		} else {
			resolve(startPoint);
		}
	})
}


/**
 * Google directions.
 * Calculates the route from the user location to the selected bar using the transport that the user clicked and opens the element with the directions.
 * @param {Object} startPoint The coordinates of the starting location.
 * @param {string} endPoint The address of the destination.
 * @param {string} mode The transport mode that was chosen (walk/drive/bike/public transport).
 *
 */
function calcRoute(startPoint, endPoint, mode) {
	googleshit.directionsRenderer.setMap(googleshit.map);
	googleshit.directionsService.route({
		origin: startPoint,
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
			googleshit.directionsRenderer.setDirections(response);
			const windowHeight = window.innerHeight;
			routeContainer.style.height = windowHeight * 0.3 + "px";
			searchContainer.style.display = "none";
			clearMarkers();
			geocodeAddress(endPoint)
				.then(results => {
					const searchPos = results[0].geometry.location;
					const endPointMarker = createMarker(searchPos, false);
					google.maps.event.addListener(endPointMarker, "click", function() {
						renderBarInfo(globalVars.clickedPlace);
						openCard();
					})
				})
				.catch(error => showErrorMessage("geocodeError: " + error));
			createMarker(startPoint, false, false);
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
	//document.getElementById('loading').classList.add('visible');
	showSearchRadius(loc, distance);

	googleshit.placesService.nearbySearch({
		location: loc,
		rankBy: google.maps.places.RankBy.DISTANCE,
		type: ["night_club"]
	}, (results, status, pagination) => processResults(results, status, pagination, loc, distance));

	googleshit.placesService.nearbySearch({
		location: loc,
		rankBy: google.maps.places.RankBy.DISTANCE,
		type: ["bar"]
	}, (results, status, pagination) => processResults(results, status, pagination, loc, distance));
}


function showSearchRadius(loc, distance) {
	const circleOptions = {
        strokeColor: '#1919ff',
        strokeOpacity: 0.3,
        strokeWeight: 3,
        fillColor: '#000000',
		fillOpacity: 0,
		center: loc,
		radius: parseFloat(distance)
	};
	googleshit.circle.setOptions(circleOptions);
	googleshit.map.fitBounds(googleshit.circle.getBounds());
}

/**
 * Processes the results of the searchNearby-method and places a marker on the map for each bar. Clicking on the marker shows the bar's info.
 * @see searchNearby
 * @param {Object[]} results The results of the Google search.
 * @param {Object} status The status of the Google search.
 * @param {Object} pagination The search only shows 20 results per page so with the pagination
 *  we can get up to 60 results instead of the default 20 (Google's max is 3 pages).
 * @param {Object} loc The location object, which has latitude and longitude.
 * @param {number} distance The range for the search in meters.
 *
 */
function processResults(results, status, pagination, loc, distanceLimit) {
	if (status !== google.maps.places.PlacesServiceStatus.OK) return;
	for (let i = 0; i < results.length; i++) {
		const actualDistance = google.maps.geometry.spherical.computeDistanceBetween(loc, results[i].geometry.location);
		if(!pagination.hasNextPage) {
			document.getElementById('loading').classList.remove('visible');
			return;
		}
		if(actualDistance > distanceLimit) {
			continue;
		};

		setTimeout((function(i){
			return function(){
				if(globalVars.searchWithVars && globalLists.bars.indexOf(results[i].name) === -1) return;
				const marker = createMarker(results[i].geometry.location);
				google.maps.event.addListener(marker, "click", function() {
					globalVars.clickedPlace = results[i];
					renderBarInfo(results[i]);
					openCard();
				});
			};
		})(i),100*i);
	}

	if (pagination.hasNextPage) {
		pagination.nextPage();
	}
}

/**
 * Creates a marker at the given location.
 * @param {Object} location The (lat,lng) coordinates of the spot where the marker should be placed.
 * @param {boolean} animate Whether or not the marker will use the drop animation. Default true.
 * @param {boolean} isBarMarker Changes the marker's icon depending on whether the marker is for a bar or for the user's location. Default true.
 *
 */
function createMarker(location, animate = true, isBarMarker = true) {
	const icon = isBarMarker ? "kgps_icons/kaljakartta_map_arrow_50.svg" : "kgps_icons/yellow-marker.png";
	const animation = animate ? google.maps.Animation.DROP : null;
	const marker = new google.maps.Marker({
		map: googleshit.map,
		position: location,
		animation: animation,
		icon: icon
	});
	globalLists.markers.push(marker);
	return marker;
}

/**
 * Clears all markers from the map and from the markers list.
 */
function clearMarkers() {
	for (let i = 0; i < globalLists.markers.length; i++) {
		globalLists.markers[i].setMap(null);
	}
	globalLists.markers = [];
}

/**
 * Creates an infowindow into the middle of the current map location and displays the error message.
 * @param {string} message The error message that will be shown in the infowindow.
 */
function showErrorMessage(message) {
	const center = googleshit.map.getCenter();
	googleshit.infowindow.setPosition(center);
	googleshit.infowindow.setContent(message);
	googleshit.infowindow.open(googleshit.map);
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
	document.querySelector('head').appendChild(script);
}


})(window, document, noUiSlider);
