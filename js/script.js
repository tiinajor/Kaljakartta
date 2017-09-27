let hki = {lat: 60.162786, lng: 24.932607};
let map;
let pos;
let infoWindow;
let markers;
let serving = '';
let searchVars = {
	serving : serving,
	price : 8.5,
	abvMin : 2.8,
	abvMax : 5.6,
	brands : [],
	types : [],
	barTypes : []
}

window.onload = function(){
	const priceSlider = document.getElementById('price-slider');
	const alcoholSlider = document.getElementById('alcohol-slider');
	const distanceSlider = document.getElementById('distance-slider');
	let geocoder = new google.maps.Geocoder();
	infoWindow = new google.maps.InfoWindow();
	markers = [];

	REST("https://jsonplaceholder.typicode.com/users");
	console.log(searchVars);

	let beerBrands = ["karhu", "koff", "karjala", "lapin kulta", "ale coq", "heineken", "pirkka", "grimbergen", "duvel", "olut"];
	let beerTypes = ["lager", "tumma lager", "vahva lager", "IPA", "bock", "Stout", "porter", "pils", "vehnäolut", "sahti", "bitter", "dobbelbock", "dry stout", "dunkel", "luostariolut", "imperial stout", "imperial porter", "mead", "trappist"];
	let barTypes = ["pubi", "urheilubaari", "yökerho", "räkälä", "karaokebaari", "viinibaari", "olutravintola"];
	createList(beerBrands, document.getElementById('brand-list'), "brands");
	createList(beerTypes, document.getElementById('type-list'), "types");
	createList(barTypes, document.getElementById('barType-list'), "barTypes");

	// hanat mukana haussa kyllä/ei
	document.getElementById('tapButton').addEventListener('click', function() {
		this.classList.toggle('selected');
		this.classList.toggle('selected-border');
		console.log(searchVars.serving);
		if(searchVars.serving == '' || searchVars.serving == 'bottle') {
			searchVars.serving = 'tap';
		} else {
			searchVars.serving = '';
		}
		console.log(searchVars);
	});

	// pullot mukana haussa kyllä/ei
	document.getElementById('bottleButton').addEventListener('click', function() {
		this.classList.toggle('selected');
		this.classList.toggle('selected-border');
		console.log(searchVars.serving);
		if(searchVars.serving == '' || searchVars.serving == 'tap') {
			searchVars.serving = 'bottle';
		} else {
			searchVars.serving = '';
		}
		console.log(searchVars);
	});

	// suurennuslasi etsii osoitteen mukaan baarit jos osoite ei ole tyhjä
	document.getElementById('search-button').addEventListener('click', function() {
		if(document.getElementById('searchbox').value != '') {
			geocodeAddress(geocoder, map, distanceSlider.noUiSlider.get());
			document.getElementById('searchbox').value = '';
		}
		
	});

	// hakukentässä enterin painaminen käynnistää haun myös
	document.getElementById('searchbox').addEventListener('keyup', function(e) {
		e.preventDefault();
		if(e.keyCode == 13 && document.getElementById('searchbox').value != ''){ 
			geocodeAddress(geocoder, map, distanceSlider.noUiSlider.get());
			this.value = '';
		}
	})

	// avaa baarityypit-listan ja sulkee muut-listat
	document.getElementById('barType-list').children[0].addEventListener('click', function() {
		let ul = document.getElementById('barType-list').children[1];
		let icon = this.children[0];
		toggleVisible(ul);
		rotateIcon(icon);
		closeList(document.getElementById('type-list'));
		closeList(document.getElementById('brand-list'));
	});

	// avaa merkit-listan ja sulkee muut-listat
	document.getElementById('brand-list').children[0].addEventListener('click', function() {
		let ul = document.getElementById('brand-list').children[1];
		let icon = this.children[0];
		toggleVisible(ul);
		rotateIcon(icon);
		closeList(document.getElementById('barType-list'));
		closeList(document.getElementById('type-list'));
	});

	// avaa oluttyypit-listan ja sulkee muut-listat
	document.getElementById('type-list').children[0].addEventListener('click', function() {
		let ul = document.getElementById('type-list').children[1];
		let icon = this.children[0];
		toggleVisible(ul);
		rotateIcon(icon);
		closeList(document.getElementById('brand-list'));
		closeList(document.getElementById('barType-list'));
	});

	// menun avaus
	document.getElementById('hamburger-menu').addEventListener('click', openMenu);

	// sulkee menun kun sen ulkopuolelle klikataan tai kun yläkulman X klikataan
	document.getElementById('menu-close-x').addEventListener('click', closeMenu);
	document.getElementById('menu-oof').addEventListener('click', closeMenu);

	// sulkee "restaurant cardin" kun sen ulkopuolelle klikataan tai kun yläkulman X klikataan
	document.getElementById('card-close-x').addEventListener('click', closeCard);
	document.getElementById('card-oof').addEventListener('click', closeCard);


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
	    console.log(searchVars);
  	});

  	alcoholSlider.noUiSlider.on('change', function() {
	    const value = alcoholSlider.noUiSlider.get();
	    searchVars.alcohol.min = value[0];
	    searchVars.alcohol.max = value[1];
	    console.log(searchVars);
  	});

/*
  	distanceSlider.noUiSlider.on('change', function() {
	    const value = distanceSlider.noUiSlider.get();
	    searchVars.distance = value;
	    console.log(searchVars);
  	});
  	*/

    locateUser(distanceSlider.noUiSlider.get());
}

// hakee URLista JSON datan
function REST(url) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send();

	xhr.onreadystatechange = function () {
	  	if (xhr.readyState === 4) {
	    	if (xhr.status === 200) {
	    		const response = JSON.parse(xhr.responseText);
	 	 		console.log(response[2]); 
	 	 		//barData(response[2]);
	        } else {
	          	console.log('Error: ' + xhr.status);
	        }
	  	}
	}
}

// ylimääränen JSONia varten
function barData(data) {
	const name = data.company.name;
	const address = data.address.street + " " + data.address.suite;
	const desc = data.company.catchPhrase;

	console.log(name);
	console.log(address);
	console.log(desc);
}


// luo listan divin sisään (aakkosjärjestyksessä ja eka kirjain isolla)
function createList(list, parentDiv, id) {
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
			toggleInSearch(li, id);
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
function toggleInSearch(li, parentID) {
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
	} else if(parentID == "barTypes") {
		if (searchVars.barTypes.indexOf(text) >= 0) {
			searchVars.barTypes.splice(searchVars.barTypes.indexOf(text), 1);
		} else {
			searchVars.barTypes.push(text);
		}
	}
	console.log(searchVars);
}

// muuttaa ekan kirjaimen isoksi
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

// avaa menun merkki- ja laatulistat niitä painettaessa
function toggleVisible(item){
	//console.log(item.style.height);
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
    document.getElementById("menu-oof").style.width = "100%";
};

/* palauttaa kartan takaisin normaaliksi kun menu suljetaan */
function closeMenu() {
    document.getElementById("side-menu").style.left = "-300px";
    document.getElementById("menu-oof").style.width = "0";
};

/* blurraa kartan kun restaurant card avataan */
function openCard() {
	document.getElementById("restaurant-card").style.right = "0";
	document.getElementById("card-oof").style.width = "100%";    
};

/* palauttaa kartan takaisin normaaliksi kun restaurant card suljetaan */
function closeCard() {
	if(window.innerWidth <= 600) {
		document.getElementById("restaurant-card").style.right = "-100%";
	} else {
		document.getElementById("restaurant-card").style.right = "-600px";
	}
	document.getElementById("card-oof").style.width = "0";
    
};

// lisää restaurant cardiin baarin tiedot
function renderBarInfo(place) {
	var openText = "Aukioloajat ei tiedossa";
	if (place.opening_hours != null) {
		if(place.opening_hours.open_now) {
			openText = "Avoinna nyt";
		} else {
			openText = "Suljettu";
		}
	}
	console.log(place);
	document.getElementById('bar-name').innerHTML = place.name;
	document.getElementById('bar-address').innerHTML = place.vicinity;
	document.getElementById('bar-desc').innerHTML = openText;
	setRating(place.rating);
};

// asettaa baarin ratinging tuopin kuvina
function setRating(rating) {
	let rounded = Math.round(rating);
	let html = '';
	for(var i=1;i<=5;i++) {
		if(i<=rating) {
			html += "<img class=\"rating-icon\" src=\"icons/pint-rating.svg\">"
		} else {
			html += "<img class=\"rating-icon\" src=\"icons/pint-rating-bw.svg\">"
		}
	}
	document.getElementById('rating').innerHTML = html;
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
		  },
		  {
		    "featureType": "transit",
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
        	map.setCenter(pos);
        	/* 
        	let marker = new google.maps.Marker({
				map: map,
				position: pos,
				label: 'YOU',
				animation: google.maps.Animation.DROP,
			});
			markers.push(marker);
			*/
        	if(pos != null) {
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
function geocodeAddress(geocoder, map, distance) {
	let userPos;
	let address = document.getElementById('searchbox').value;
	geocoder.geocode(
		{'address': address,
		componentRestrictions: {
			country: 'FI'
		}}, function(results, status) {
		if (status == 'OK') {
			userPos = results[0].geometry.location;
			map.setCenter(userPos);
			let marker = new google.maps.Marker({
				map: map,
				position: userPos,
			});
			markers.push(marker);
			searchNearby(userPos, distance);
		} else {
			alert('Geocode was not successful for the following reason: ' + status);
		}
	})
};

// hakee max 60 baaria annetun sijainnin läheltä
function searchNearby(loc, distance) {
	clearMarkers();
	let service = new google.maps.places.PlacesService(map);
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
			createMarker(results[i]);
		}
    }
};

// luo markerin ja sitä klikatessa avaa restaurant cardin kyseisen baarin tiedoilla
function createMarker(place) {
	var marker = new google.maps.Marker({
		map: map,
		position: place.geometry.location
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
	                      'Error: The Geolocation service failed.' :
	                      'Error: Your browser doesn\'t support geolocation.');
	infoWindow.open(map);
};
