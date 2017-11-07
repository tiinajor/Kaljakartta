let hki = {lat: 60.162786, lng: 24.932607};
let map;
let pos;
let infoWindow;
let markers;

window.onload = function(){
	const priceSlider = document.getElementById('price-slider');
	const alcoholSlider = document.getElementById('alcohol-slider');
	const distanceSlider = document.getElementById('distance-slider');
	const buttons = document.getElementsByClassName('directions-button');
	const handle = document.querySelector('.draggable');
	const headerElement = document.querySelector('header');
	const mapElement = document.getElementById('map');
	const directionsElement = document.getElementById('route');
	const directionsService = new google.maps.DirectionsService;
    const directionsRenderer = new google.maps.DirectionsRenderer({suppressMarkers: true});
    let headerHeight = headerElement.clientHeight;
	let windowHeight = window.innerHeight;
    let serving = '';
    let mouseDown = false;
    let mouseStartPos;
    let handleOffset;
    let directionsMaxHeight;
    let mapMinHeight;
    let servingAsc = false;
    let typeAsc = false;
    let brandAsc = false;
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

	infoWindow = new google.maps.InfoWindow();
	markers = [];
	directionsRenderer.setPanel(document.getElementById('route'));

	document.querySelector('.title').innerHTML += ("<span class='version'>alpha</span>");

	//showModal();
	//localhost:xxxx/getRestaurant
	getJSON("https://localhost:130/restaurant?name=Boothill").then(data => console.log("AKI ON VELHO" + data));;
	const barBeerList = [
		{
			serving: "tap",
			brand: "karhu",
			type: "lager",
			price: 3.80,
			abv: 4.7,
			vol: 0.5
		},
		{
			serving: "tap",
			brand: "heineken",
			type: "lager",
			price: 4.50,
			abv: 4.8,
			vol: 0.4
		},
		{
			serving: "bottle",
			brand: "aura",
			type: "lager",
			price: 3.90,
			abv: 4.7,
			vol: 0.35
		},
		{
			serving: "bottle",
			brand: "Grimbergen Double-Ambree",
			type: "tumma lager",
			price: 4.95,
			abv: 8.0,
			vol: 0.33
		},
		{
			serving: "bottle",
			brand: "Laitilan IPA",
			type: "Ale",
			price: 4.30,
			abv: 4.5,
			vol: 0.568
		},
		{
			serving: "bottle",
			brand: "BrewDog Punk IPA",
			type: "Ale",
			price: 3.39,
			abv: 5.6,
			vol: 0.33
		},
		{
			serving: "bottle",
			brand: "Sandels Vahva",
			type: "Vahva lager",
			price: 2.49,
			abv: 7.5,
			vol: 0.33
		},
		{
			serving: "bottle",
			brand: "Saku Porter",
			type: "Porter",
			price: 3.69,
			abv: 6.9,
			vol: 0.5
		},
		{
			serving: "bottle",
			brand: "Moa Imperial Stout",
			type: "Stout",
			price: 7.91,
			abv: 10.2,
			vol: 0.5
		},
		{
			serving: "bottle",
			brand: "Pyynikin Black IPA",
			type: "Ale",
			price: 4.99,
			abv: 8.5,
			vol: 0.33
		},
		{
			serving: "tap",
			brand: "Weihenstephaner Pils",
			type: "pils",
			price: 3.68,
			abv: 5.1,
			vol: 0.5
		},
		{
			serving: "bottle",
			brand: "leffe Blonde",
			type: "Ale",
			price: 3.92,
			abv: 6.6,
			vol: 0.33
		},
		{
			serving: "tap",
			brand: "Krombacher Weizen",
			type: "Vehnäolut",
			price: 3.75,
			abv: 5.3,
			vol: 0.5
		},
		{
			serving: "tap",
			brand: "Olvi A",
			type: "Lager",
			price: 4.50,
			abv: 5.2,
			vol: 0.4
		},
		{
			serving: "bottle",
			brand: "Stadin Panimo South Pacific IPL",
			type: "Lager",
			price: 4.99,
			abv: 5.3,
			vol: 0.33
		},
		{
			serving: "bottle",
			brand: "Duvel",
			type: "Ale",
			price: 3.98,
			abv: 8.5,
			vol: 0.33
		},
		{
			serving: "bottle",
			brand: "Pyynikin Sessio White IPA",
			type: "Ale",
			price: 3.62,
			abv: 4.6,
			vol: 0.33
		},
		{
			serving: "bottle",
			brand: "Grimbergen Blanche",
			type: "Vehnäolut",
			price: 3.29,
			abv: 6.0,
			vol: 0.33
		},
		{
			serving: "bottle",
			brand: "Sonnisaari Oranki",
			type: "Ale",
			price: 4.93,
			abv: 5.7,
			vol: 0.33
		},
		{
			serving: "tap",
			brand: "BrewDog Punk IPA",
			type: "Ale",
			price: 6.30,
			abv: 5.6,
			vol: 0.4
		},
		{
			serving: "bottle",
			brand: "Laitilan Savu IPA",
			type: "Ale",
			price: 3.99,
			abv: 5.9,
			vol: 0.33
		},
		{
			serving: "bottle",
			brand: "Piraat Tripple Hop",
			type: "Ale",
			price: 4.70,
			abv: 10.5,
			vol: 0.33
		},
		{
			serving: "tap",
			brand: "Olvi Tuplapukki",
			type: "Vahva Lager",
			price: 7.40,
			abv: 8.5,
			vol: 0.5
		}/*,
		{
			serving: "bottle",
			brand: "Fat Lizard Taspy Mary Double IPA",
			type: "Ale",
			price: 3.98,
			abv: 8.0,
			vol: 0.25
		}
		,
		{
			serving: "bottle",
			brand: "Corona Extra",
			type: "Lager",
			price: 4.90,
			abv: 4.5,
			vol: 0.355
		},
		{
			serving: "bottle",
			brand: "Olvi Iisalmi IPA",
			type: "Ale",
			price: 3.45,
			abv: 5.0,
			vol: 0.5
		}*/
	]
	let beerBrands = ["karhu", "koff", "karjala", "lapin kulta", "ale coq", "heineken", "pirkka", "grimbergen", "duvel", "olut"];
	let beerTypes = ["lager", "tumma lager", "vahva lager", "IPA", "bock", "Stout", "porter", "pils", "vehnäolut", "sahti", "bitter", "dobbelbock", "dry stout", "dunkel", "luostariolut", "imperial stout", "imperial porter", "mead", "trappist"];
	createList(beerBrands, document.getElementById('brand-list'), "brands", searchVars);
	createList(beerTypes, document.getElementById('type-list'), "types", searchVars);
	createBeersTable(barBeerList);
	
	const theads = document.getElementsByTagName('th');
	Array.from(theads).forEach((e) => e.addEventListener('click', function() {
		const column = e.getAttribute('data-id');
		let sorteValues;
		switch(column) {
			case 'serving':
				servingAsc = !servingAsc;
				sortedValues = barBeerList.sort(sortBy(column, servingAsc));
				updateTable(sortedValues);
				break;
			case 'brand':
				brandAsc = !brandAsc;
				sortedValues = barBeerList.sort(sortBy(column, brandAsc));
				updateTable(sortedValues);
				break;
			case 'type':
				typeAsc = !typeAsc;
				sortedValues = barBeerList.sort(sortBy(column, typeAsc));
				updateTable(sortedValues);
				break;
			case 'abv':
				abvAsc = !abvAsc;
				sortedValues = barBeerList.sort(sortBy(column, abvAsc));
				updateTable(sortedValues);
				break;
			case 'vol':
				volAsc = !volAsc;
				sortedValues = barBeerList.sort(sortBy(column, volAsc));
				updateTable(sortedValues);
				break;
			case 'price':
				priceAsc = !priceAsc;
				sortedValues = barBeerList.sort(sortBy(column, priceAsc));
				updateTable(sortedValues);
				break;
			default:
				break;
		}

	}));



	// asettaa kartan, menun, reittiohjeiden sekä baarikortin korkeuden ja korjaa niitä aina kun ikkunan koko muuttuu
	resizeWindow();
	window.addEventListener('resize', debounce(resizeWindow,100,false));

	// hanat mukana haussa kyllä/ei
	document.getElementById('tapButton').addEventListener('click', function() {
		this.classList.toggle('selected');
		this.classList.toggle('selected-border');
		if(searchVars.serving == '' || searchVars.serving == 'bottle') {
			searchVars.serving = 'tap';
		} else {
			searchVars.serving = '';
		}
	});

	// pullot mukana haussa kyllä/ei
	document.getElementById('bottleButton').addEventListener('click', function() {
		this.classList.toggle('selected');
		if(searchVars.serving == '' || searchVars.serving == 'tap') {
			searchVars.serving = 'bottle';
		} else {
			searchVars.serving = '';
		}
	});

	// kartan päällä olevan hakukentän suurennuslasi etsii osoitteen mukaan baarit jos osoite ei ole tyhjä
	document.getElementById('search-button').addEventListener('click', function() {
		const input = document.getElementById('searchbox');
		if(input.value != '') {
			directionsRenderer.setMap(null);
			clearMarkers();
			geocodeAddress(input.value, distanceSlider.noUiSlider.get());
			input.value = '';
		}
	});

	// hakukentässä enterin painaminen käynnistää haun myös
	document.getElementById('searchbox').addEventListener('keyup', function(e) {
		e.preventDefault();
		const input = document.getElementById('searchbox');
		if(e.keyCode == 13 && input.value != ''){ 
			directionsRenderer.setMap(null);
			clearMarkers();
			geocodeAddress(input.value, distanceSlider.noUiSlider.get());
			this.value = '';
		}
	});

	// menun suurennuslasi etsii osoitteen mukaan baarit jos osoite ei ole tyhjä
	document.getElementById('menu-search-button').addEventListener('click', function() {
		const input = document.getElementById('menu-searchbox');
		if(input.value != '') {
			closeMenu();
			clearMarkers();
			directionsRenderer.setMap(null);
			geocodeAddress(input.value, distanceSlider.noUiSlider.get());
			input.value = '';
		}
	});

	// menun hakukentässä enterin painaminen käynnistää haun myös
	document.getElementById('menu-searchbox').addEventListener('keyup', function(e) {
		e.preventDefault();
		const input = document.getElementById('menu-searchbox');
		if(e.keyCode == 13 && input.value != ''){ 
			closeMenu();
			clearMarkers();
			directionsRenderer.setMap(null);
			geocodeAddress(input.value, distanceSlider.noUiSlider.get());
			this.value = '';
		}
	});

	// avaa merkit-listan ja sulkee muut listat
	document.getElementById('brand-list').children[0].addEventListener('click', function() {
		let ul = document.getElementById('brand-list').children[1];
		let icon = this.children[0];
		toggleVisible(ul);
		rotateIcon(icon);
		closeList(document.getElementById('type-list'));
	});

	// avaa oluttyypit-listan ja sulkee muut listat
	document.getElementById('type-list').children[0].addEventListener('click', function() {
		let ul = document.getElementById('type-list').children[1];
		let icon = this.children[0];
		toggleVisible(ul);
		rotateIcon(icon);
		closeList(document.getElementById('brand-list'));
	});

	// menun avaus
	document.getElementById('hamburger-menu').addEventListener('click', openMenu);

	// käyttäjän GPS paikannus
	document.getElementById('locate').addEventListener('click', () => {
		document.getElementById('route').style.height = 0+"px";
		document.getElementById('search-container').style.position = "absolute";
		resizeWindow();
		directionsRenderer.setMap(null);
		clearMarkers();
		locateUser(distanceSlider.noUiSlider.get());
	});

	// menun sulkeminen
	document.getElementById('menu-close-x').addEventListener('click', closeMenu);
	document.getElementById('oof').addEventListener('click', closeMenu);

	// "restaurant cardin" sulkeminen
	document.getElementById('card-close-x').addEventListener('click', closeCard);
	document.getElementById('oof').addEventListener('click', closeCard);

	// modaalin sulkeminen
	document.getElementById('modal-close-x').addEventListener('click', hideModal);
	document.getElementById('oof').addEventListener('click', hideModal);

	// reittiohjeen sulkeminen
	document.getElementById('route-close-x').addEventListener('click', function() {
		directionsRenderer.setMap(null);
		closeDirections();
		resizeWindow();
	});

	// reittioheiden koon muuttaminen koneella
	handle.addEventListener('mousedown', (e) => {
		mouseDown = true;
		mouseStartPos = e.pageY;
		handleOffset = mouseStartPos - handle.getBoundingClientRect().top;
		const routeOptionsHeight = document.querySelector('.adp-list') != null ? document.querySelector('.adp-list').clientHeight : 0;
		directionsMaxHeight = document.querySelector('.adp').clientHeight  + routeOptionsHeight + 8;
		mapMinHeight = windowHeight - headerHeight - directionsMaxHeight;
	});
	handle.addEventListener('touchstart', (e) => {
		mouseDown = true;
		mouseStartPos = e.pageY;
		handleOffset = mouseStartPos - handle.getBoundingClientRect().top;
		const routeOptionsHeight = document.querySelector('.adp-list') != null ? document.querySelector('.adp-list').clientHeight : 0;
		directionsMaxHeight = document.querySelector('.adp').clientHeight  + routeOptionsHeight + 8;
		mapMinHeight = windowHeight - headerHeight - directionsMaxHeight;
	});
	window.addEventListener('touchend', () => mouseDown = false);
	window.addEventListener('mouseleave', () => mouseDown = false);
	window.addEventListener('mouseup', () => mouseDown = false);
	window.addEventListener('mousemove', (e) => {
		if(!mouseDown) return;
		e.preventDefault();
		const handleTopPos = e.pageY - handleOffset;
		const directionsHeight = windowHeight - handleTopPos;
		const mapHeight = windowHeight - directionsHeight - headerHeight;		
		mapElement.style.height = (mapHeight > mapMinHeight) ? mapHeight + "px" : mapMinHeight + "px";
		directionsElement.style.height = (directionsHeight < directionsMaxHeight) ? directionsHeight + "px" : directionsMaxHeight + "px";
	});

	//reittiohjeiden koon muuttaminen mobiilissa
	handle.addEventListener('touchstart', (e) => {
		e.preventDefault();
		mouseDown = true;
		mouseStartPos = e.touches[0].pageY;
		handleOffset = mouseStartPos - handle.getBoundingClientRect().top;
		const routeOptionsHeight = document.querySelector('.adp-list') != null ? document.querySelector('.adp-list').clientHeight : 0;
		directionsMaxHeight = document.querySelector('.adp').clientHeight  + routeOptionsHeight + 8;
		mapMinHeight = windowHeight - headerHeight - directionsMaxHeight;
	});
	window.addEventListener('touchend', () => mouseDown = false);
	window.addEventListener('touchcancel', () => mouseDown = false);
	window.addEventListener('touchmove', (e) => {
		if(!mouseDown || e.touches.length === 0) return;
		e.preventDefault();
		const handleTopPos = e.touches[0].pageY - handleOffset;
		const directionsHeight = windowHeight - handleTopPos;
		const mapHeight = windowHeight - directionsHeight - headerHeight;		
		mapElement.style.height = (mapHeight > mapMinHeight) ? mapHeight + "px" : mapMinHeight + "px";
		directionsElement.style.height = (directionsHeight < directionsMaxHeight) ? directionsHeight + "px" : directionsMaxHeight + "px";
	});

	// reittiohjenapit asettaa kulkuneuvon napin ID:n mukaan
	Array.from(buttons).forEach((e) => e.addEventListener('click', function() {
		const endPoint = document.getElementById('bar-address').textContent;
		const barName = document.getElementById('bar-name').textContent;
		const mode = e.id.toUpperCase();
		calcRoute(directionsService,directionsRenderer,endPoint,mode);
		geocodeAddress(barName, 1);
	}));

	// "hae"-nappi lähettää kyselyn tietokantaan
	//document.getElementsByClassName('button-submit')[0].addEventListener('click', () => postJSON("http://validate.jsontest.com/?json=", searchVars));

	//slaiderien luonti
	noUiSlider.create(priceSlider, {
		start: 8.5,
		connect: [true, false],
		step: 0.5,
		range: {
		  'min': [  0 ],
		  'max': [ 25 ]
		},
		format: wNumb({
		  decimals: 1,
		})
	});
  	noUiSlider.create(alcoholSlider, {
	    start: [ 2.8, 5.6 ],
	    connect: true,
	    range: {
	      'min': [ 0 ],
	      'max': [ 12 ]
	    },
	    format: wNumb({
	      decimals: 1,
	    })
  	});
    noUiSlider.create(distanceSlider, {
	    start: 500,
	    connect: [true, false],
	    range: {
	      'min': [  0, 50 ],
	      '50%': [  1000, 500 ],
	      'max': [ 5000 ]
	    },
	    format: wNumb({
	      decimals: 0,
	    })
  	});
	
	// slaidereiden liikuttaminen päivittää niihin liittyvät tekstit
  	priceSlider.noUiSlider.on('update', function() {
	    const value = priceSlider.noUiSlider.get();
	    document.getElementById("price").innerHTML = "0 - " + value + "€";
  	});
  	alcoholSlider.noUiSlider.on('update', function() {
	    const value = alcoholSlider.noUiSlider.get();
	    document.getElementById("alcohol").innerHTML = value[0] + " - " + value[1] + "%";
  	});
  	distanceSlider.noUiSlider.on('update', function() {
	    const value = distanceSlider.noUiSlider.get();
	    document.getElementById("distance").innerHTML = "< " + value + "m";
  	});

	// slaidereiden siirtäminen päivittää hakukriteerit
  	priceSlider.noUiSlider.on('change', function() {
	    const value = priceSlider.noUiSlider.get();
	    searchVars.price = value[1];  
  	});
  	alcoholSlider.noUiSlider.on('change', function() {
	    const value = alcoholSlider.noUiSlider.get();
	    searchVars.alcohol.min = value[0];
	    searchVars.alcohol.max = value[1];
  	});


};
// ---- WINDOW.ONLOAD LOPPU ---- 

function createBeersTable(beers) {
	const table = document.querySelector('.beers-table');
	const bottleIcon = "kgps_icons/beer-bottle.svg";
	const tapIcon = "kgps_icons/beer-tap.svg"
	let html = '';
	html += `
	<thead>
	<tr>
		<th class="column-s" data-id="serving">Icon</th>
		<th class="column-l" data-id="brand">Nimi</th>
		<th class="column-m" data-id="type">Tyyppi</th>
		<th class="column-s" data-id="vol">Koko (l)</th>
		<th class="column-s" data-id="abv">Alk-%</th>
		<th class="column-s" data-id="price">Hinta</th>
	</tr>
	</thead>
	<tbody>`;
	
	for(let i=0;i<beers.length;i++) {
		const beer = beers[i];
		const brand = capitalizeFirstLetter(beer.brand);
		const type = capitalizeFirstLetter(beer.type);
		let src = '';
		beer.serving === "tap" ? src=tapIcon : src=bottleIcon;
		html += `
		<tr>
		<td class="column-xs"><img src=${src} alt="pullot"></td>
		<td class="column-l">${brand}</td>
		<td class="column-m">${type}</td>
		<td class="column-s">${beer.vol}</td>
		<td class="column-s">${beer.abv}</td>
		<td class="column-s">${beer.price}</td>
		</tr>`;
	}
	html += '</tbody>'
	table.innerHTML = html;
	const rows = document.getElementsByTagName('tr');
	for (let i=0; i<rows.length; i++) {
		if(i % 2 !== 0) {
			rows[i].classList.add('odd-row');
		}
	}
};

function updateTable(barBeerList) {
	const rows = document.querySelector('tbody').rows;
	const bottleIcon = "kgps_icons/beer-bottle.svg";
	const tapIcon = "kgps_icons/beer-tap.svg"
	for(let i = 0; i < rows.length; i++){
		const icon = barBeerList[i].serving === "tap" ? tapIcon : bottleIcon;
    	rows[i].cells[0].innerHTML = `<img src=${icon}>`;
    	rows[i].cells[1].textContent = capitalizeFirstLetter(barBeerList[i].brand);
    	rows[i].cells[2].textContent = capitalizeFirstLetter(barBeerList[i].type);
    	rows[i].cells[3].textContent = barBeerList[i].vol;
    	rows[i].cells[4].textContent = barBeerList[i].abv;
    	rows[i].cells[5].textContent = barBeerList[i].price;
    }
}

function sortBy(col, ascend=true) {
  	return function(a, b) {
		if(!a.hasOwnProperty(col) || !b.hasOwnProperty(col)) {
		  // property doesn't exist on either object
		    return 0; 
		}
		const x = a[col];
		const y = b[col];
		if(typeof x === "string" && typeof y === "string") {
			return ascend ? x.localeCompare(y) : y.localeCompare(x);
		} else {
			return ascend ? (parseFloat(x) - parseFloat(y)) : (parseFloat(y) - parseFloat(x));
		}    
  	};
}

// GET
function getJSON(url) {
	return fetch(url).then(response => response.json());
};

// POST
function postJSON(url, param) {
	let xhr = new XMLHttpRequest();
	xhr.open("POST", url+param, true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.send(); 
	xhr.onreadystatechange = function () {
		if (xhr.readyState == 4 && xhr.status == 200) {
			//console.log(xhr.responseText);               
		}
	};
}

// luo listan divin sisään (aakkosjärjestyksessä)
function createList(list, parentDiv, id, searchVars) {
	const ul = document.createElement('ul');
	ul.id = id;
	for (var i = 0; i<list.length; i++) {
		list[i] = capitalizeFirstLetter(list[i]);
	}
	list = list.sort();
	for (var i = 0; i<list.length; i++) {
		let li = document.createElement('li');
		let content = document.createTextNode(list[i]);
		li.appendChild(content);
		li.addEventListener('click', function() {
			this.classList.toggle('selected');
			toggleInSearch(li, id, searchVars);
		});
		ul.appendChild(li);	
	}
	parentDiv.appendChild(ul);
};

// sulkee menun listan
function closeList(div) {
	let otherList = div.children[1];
	let otherDiv = div.children[0];
	let icon = otherDiv.children[0];
	otherList.style.height = '0px';
	let closed = true;
	icon.style.transform = "rotate(-90deg)";
};

// lisää/poistaa käyttäjän valitsemat olutmerkit ja -tyypit sekä baarityypit hakukriteereihin
function toggleInSearch(li, parentID, searchVars) {
	let text = li.textContent || li.innerText;
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
};

//laskee elementeille uudet korkeudet kun ikkunan koko muuttuu
function resizeWindow() {
	const windowHeight = window.innerHeight;
	const headerHeight = document.querySelector('header').clientHeight;
	const routeHeight = document.getElementById('route').clientHeight;
	const mapHeight = routeHeight > 0 ? (windowHeight - headerHeight - routeHeight) : (windowHeight - headerHeight); 
	document.getElementById('side-menu').style.height = windowHeight + "px";
	document.getElementById('restaurant-card').style.height = windowHeight + "px";
	document.getElementById('map').style.height = mapHeight + "px";
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

// avaa menun merkki- ja laatulistat niitä painettaessa
function toggleVisible(item){
    if (item.style.height === '195px'){
        item.style.height = '0px';
    }else{
        item.style.height = '195px';
    }
};

// kääntää menun listojen "kolmio-iconit" kun lista avataan/suljetaan
function rotateIcon(icon) {
	if (icon.style.transform === 'rotate(0deg)') {
		icon.style.transform = 'rotate(-90deg)';
	} else {
		icon.style.transform = 'rotate(0deg)';
	};
};

/* blurraa kartan kun menu avataan */
function openMenu() {
    document.getElementById("side-menu").style.left = "0px";
    document.getElementById("oof").style.width = "100%";
};

/* palauttaa kartan takaisin normaaliksi kun menu suljetaan */
function closeMenu() {
    document.getElementById("side-menu").style.left = "-300px";
    document.getElementById("oof").style.width = "0";
};

/* blurraa kartan kun restaurant card avataan ja baarin kuvaksi loading icon*/
function openCard() {
	document.getElementById("restaurant-card").style.right = "0";
	document.getElementById("oof").style.width = "100%";    
	document.getElementById("bar-photo").style.backgroundImage = "url('kgps_icons/beer-load.gif')";
	document.getElementById("bar-photo").style.backgroundSize = "150px";
};

/* palauttaa kartan takaisin normaaliksi kun restaurant card suljetaan */
function closeCard() {
	document.getElementById("restaurant-card").style.right = window.innerWidth <= 600 ? "-100%" : "-600px";
	document.getElementById("oof").style.width = "0";
};

// sulkee reittiohjeet
function closeDirections() {
	const windowHeight = window.innerHeight;
	const headerHeight = document.getElementsByTagName('header')[0].clientHeight;
	const mapHeight = windowHeight - headerHeight + "px";
	const directionsHeight = 0 + "px";
	document.getElementById('map').style.height = mapHeight;
	document.getElementById('route').style.height = directionsHeight;
	document.getElementById('search-container').style.display = "block";
}

// luo pop-up käyttöohjeet
function showModal() {
	const modal = document.getElementById('modal');
	const oof = document.getElementById('oof');
	oof.style.width = "100%";
	modal.classList.add('visible');
	
}

// sulkee modalin
function hideModal() {
	const modal = document.getElementById('modal');
	const oof = document.getElementById('oof');
	modal.style.display = "none";
	oof.style.width = 0+"px";
}

// lisää restaurant cardiin baarin tiedot
function renderBarInfo(place) {
	const date = new Date();
	const weekday = date.getDay() > 0 ? date.getDay()-1 : 6;
	const barAddress = document.getElementById('bar-address');
	const barName = document.getElementById('bar-name');
	const barOpen = document.getElementById('bar-open');
	const barPhoto = document.getElementById('bar-photo');
	const service = new google.maps.places.PlacesService(map);

	barName.innerHTML = place.name;
	setRating(place.rating);
	
	service.getDetails({
  		placeId: place.place_id
    }, function(data, status) {
  		if (status === google.maps.places.PlacesServiceStatus.OK) {
      		const address = data.formatted_address;
      		const url = data.photos[0].getUrl({ 'maxWidth': 600 });
      		barAddress.innerHTML = address.split("," ,2).join(); 
      		barOpen.innerHTML = capitalizeFirstLetter(data.opening_hours.weekday_text[weekday]);	
      		barPhoto.style.backgroundSize = "cover";
 	 		barPhoto.style.backgroundImage = "url("+url+")";
  		}
    });
};

// asettaa baarin ratinging tuopin kuvina
function setRating(rating) {
	let rounded = Math.round(rating);
	let html = '';
	for(var i=1;i<=5;i++) {
		if(i<=rating) {
			html += "<img class=\"rating-icon\" src=\"kgps_icons/pint-rating.svg\">"
		} else {
			html += "<img class=\"rating-icon\" src=\"kgps_icons/pint-rating-bw.svg\">"
		}
	}
	document.getElementById('rating').innerHTML = html;
};

// apufunctio hillitsemään windowResize kutsumista
function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) {
			func.apply(context, args)
		};
	};
};


// ----- TÄSTÄ ALASPÄIN VAIN KARTTAAN LIITTYVIÄ FUNKTIOITA ----

// luo kartan 
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
      	center: {lat: 60.162786, lng: 24.932607},
		zoom: 14,
		gestureHandling: 'greedy',
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
};

// paikantaa käyttäjän ja hakee lähimmät baarit jos paikannus onnistuu/sallittu
function locateUser(distance) {
	if (navigator.geolocation) {
  		navigator.geolocation.getCurrentPosition(function(position) {
	        pos = {
	          	lat: position.coords.latitude,
	          	lng: position.coords.longitude
	        };
	        if(pos != null) {
	    		map.setCenter(pos);
	    		searchNearby(pos, distance);
	    	}
	 	}, function() {
			handleLocationError(true, infoWindow, map.getCenter());
  		});
	} else {
		// Browser doesn't support Geolocation
		handleLocationError(false, infoWindow, map.getCenter());
	}
};

// käyttäjän tekemä osoitehaku hakukentässä
function geocodeAddress(address, distance) {
	const geocoder = new google.maps.Geocoder();
	const image = 'kgps_icons/yellow-marker.png';
	geocoder.geocode(
		{'address': address,
		componentRestrictions: {
			country: 'FI'
		}}, function(results, status) {
		if (status == 'OK') {
			const searchPos = results[0].geometry.location;
			map.setCenter(searchPos);
			let marker = new google.maps.Marker({
				map: map,
				position: searchPos,
				icon: image
			});
			markers.push(marker);
			// jos etsitty paikka on baari/yökerho -> näyttää vain sen markerin, muuten etsii baarit lähistöltä normaalisti
			results[0].types.filter(type => type === "bar" || type === "night_club").length > 0 ? searchNearby(searchPos, 1) : searchNearby(searchPos, distance);
		} else {
			alert('Paikannus ei onnistunut: ' + status);
		}
	})
};

// reitti käyttäjän lokaatiosta osoitteeseen
function calcRoute(directionsService, directionsRenderer, endPoint, mode) {
	if (pos == undefined && navigator.geolocation) {
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
		    modes: ['BUS', 'RAIL'],
		    routingPreference: 'FEWER_TRANSFERS'
	  	},
	  	drivingOptions: {
			departureTime: new Date(Date.now()),
			trafficModel: 'bestguess'
		},
		provideRouteAlternatives: true,
		region: "FI"
	}, function(response, status) {
		if (status === 'OK') {
			showDirections(directionsRenderer, response);
		} else {
			window.alert('Reittioheiden hakeminen ei onnistunut: ' + status);
		}
	});
};

// avaa #route ja näyttää reitin sekä reittiohjeet
function showDirections(directionsRenderer, response) {
	directionsRenderer.setDirections(response);
	const windowHeight = window.innerHeight;
	document.getElementById('route').style.height = windowHeight * 0.3 + "px";
	document.getElementById('search-container').style.display = "none";
	resizeWindow();
	closeCard();
}

// hakee max 60 baaria ja 60 yökerhoa annetun sijainnin läheltä
function searchNearby(loc, distance) {
	const image = 'kgps_icons/yellow-marker.png';
	let marker = new google.maps.Marker({
		map: map,
		position: pos,
		icon : image,
	});
	markers.push(marker);
	let service = new google.maps.places.PlacesService(map);
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
};

// käsittelee hakutulokset ja lisää markerit niiden kohdille karttaan
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
};

// luo markerin ja sitä klikatessa avaa restaurant cardin kyseisen baarin tiedoilla
function createMarker(place) {
	var marker = new google.maps.Marker({
		map: map,
		position: place.geometry.location,
		animation: google.maps.Animation.DROP,
		//icon: 'kgps_icons/favicon-32x32.png',
	});
	markers.push(marker);
	google.maps.event.addListener(marker, 'click', function() {
		renderBarInfo(place);
		openCard();
	});
};

// poistaa kaikki markerit kartalta
function clearMarkers() {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }
};

// googlen oma error funktio
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
	infoWindow.setPosition(pos);
	infoWindow.setContent(browserHasGeolocation ?
	                      'Error: Paikannus epäonnistui.' :
	                      'Error: Selaimesi ei tue paikannusta.');
	infoWindow.open(map);
};