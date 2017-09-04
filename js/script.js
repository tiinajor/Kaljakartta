window.onload = function(){
	const priceSlider = document.getElementById('price-slider');
	const alcoholSlider = document.getElementById('alcohol-slider');
	const distanceSlider = document.getElementById('distance-slider');

	let beerBrands = ["karhu", "koff", "karjala", "lapin kulta", "ale coq", "heineken", "pirkka", "grimbergen", "duvel", "olut"];
	let beerTypes = ["lager", "IPA", "bock", "Stout", "porter", "pilsner", "vehnäolut", "sahti", "dark ale", "märzen"];
	createList(beerBrands, document.getElementById('brand-list'));
	createList(beerTypes, document.getElementById('type-list'));

	var bar = { "name":"Boothill", 
				"address":"Lönnrotinkatu 25", 
				"description":"Rock-baari. Kotoisa, live-musiikkia"};
	renderBarInfo(bar);

	// hanat mukana haussa kyllä/ei
	document.getElementById('tapButton').addEventListener('click', function() {
		tapButton.classList.toggle('selected');
	});

	// pullot mukana haussa kyllä/ei
	document.getElementById('bottleButton').addEventListener('click', function() {
		bottleButton.classList.toggle('selected');
	});

	// avaa merkit-listan ja sulkee oluttyypit-listan
	document.getElementById('brand-list').children[0].addEventListener('click', function() {
		let ul = document.getElementById('brand-list').children[1];
		let icon = this.children[0];
		let typeList = document.getElementById('type-list');
		toggleVisible(ul);
		rotateIcon(icon);
		closeOtherList(typeList);
	});

	// avaa oluttyypit-listan ja sulkee merkit-listan
	document.getElementById('type-list').children[0].addEventListener('click', function() {
		let ul = document.getElementById('type-list').children[1];
		let icon = this.children[0];
		let brandList = document.getElementById('brand-list');
		toggleVisible(ul);
		rotateIcon(icon);
		closeOtherList(brandList);
	});

	// menun avaus mobiilissa
	document.getElementById('hamburger-menu').addEventListener('click', openMenu);

	// sulkee menun kun sen ulkopuolelle klikataan tai kun yläkulman X klikataan
	document.getElementById('menu-close-x').addEventListener('click', closeMenu);
	document.getElementById('menu-oof').addEventListener('click', closeMenu);

	// sulkee "restaurant cardin" kun sen ulkopuolelle klikataan tai kun yläkulman X klikataan
	document.getElementById('card-close-x').addEventListener('click', closeCard);
	document.getElementById('card-oof').addEventListener('click', closeCard);

	noUiSlider.create(priceSlider, {
		start: [ 0, 8.5 ],
		connect: true,
		behaviour: 'tap-drag',
		step: 0.5,
		range: {
		  'min': [  0 ],
		  'max': [ 25 ]
		},
		format: wNumb({
		  decimals: 1,
		  postfix: '€',
		})
	});

  	noUiSlider.create(alcoholSlider, {
	    start: [ 2.8, 5.6 ],
	    connect: true,
	    behaviour: 'tap-drag',
	    range: {
	      'min': [ 0 ],
	      'max': [ 12 ]
	    },
	    format: wNumb({
	      decimals: 1,
	      postfix: '%',
	    })
  	});

    noUiSlider.create(distanceSlider, {
	    start: 500,
	    connect: [true, false],
	    behaviour: 'tap-drag',
	    range: {
	      'min': [  0, 50 ],
	      '50%': [  1000, 500 ],
	      'max': [ 5000 ]
	    },
	    format: wNumb({
	      decimals: 0,
	      postfix: 'm',
	    })
  	});
	
	// slaidereiden liikuttaminen päivittää niihin liittyvät tekstit
  	priceSlider.noUiSlider.on('update', function() {
	    let value = priceSlider.noUiSlider.get();
	    document.getElementById("price").innerHTML = value[0] + " - " + value[1];
  	});

  	alcoholSlider.noUiSlider.on('update', function() {
	    let value = alcoholSlider.noUiSlider.get();
	    document.getElementById("alcohol").innerHTML = value[0] + " - " + value[1];
  	});

  	distanceSlider.noUiSlider.on('update', function() {
	    let value = distanceSlider.noUiSlider.get();
	    document.getElementById("distance").innerHTML = "< " + value;
  	});


};


// luo listan divin sisään (aakkosjärjestyksessä ja eka kirjain isolla)
function createList(list, parentDiv) {
	const ul = document.createElement('ul');

	for (var i = 0; i<list.length; i++) {
		list[i] = capitalizeFirstLetter(list[i]);
	}
	list = list.sort();
	
	for (var i = 0; i<list.length; i++) {
		let li = document.createElement('li');
		let content = document.createTextNode(list[i]);
		li.appendChild(content);
		ul.appendChild(li);
	}
	parentDiv.appendChild(ul);
};

// muuttaa ekan kirjaimen isoksi
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};



/* luo kartan */
function initMap() {

  	var position = {lat: 60.162786, lng: 24.932607};
  	var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 14,
    center: position
  	});
  	/*
  	var marker = new google.maps.Marker({
   		position: position,
    	map: map
  	});
  	*/
};

function renderBarInfo(bar) {
	document.getElementById('bar-name').innerHTML = bar.name;
	document.getElementById('bar-address').innerHTML = bar.address;
	document.getElementById('bar-desc').innerHTML = bar.description;
};

function toggleVisible(item){
	console.log(item.style.height);
    if (item.style.height === '195px'){
        item.style.height = '0px';
    }else{
        item.style.height = '195px';
    }
};

function rotateIcon(icon) {
	if (icon.style.transform === 'rotate(0deg)') {
		icon.style.transform = 'rotate(90deg)';
	} else {
		icon.style.transform = 'rotate(0deg)';
	};
};

function closeOtherList(div) {
	let otherList = div.children[1];
	let otherDiv = div.children[0];
	let icon = otherDiv.children[0];

	otherList.style.height = '0px';
	icon.style.transform = "rotate(90deg)";
};

function toggleActive(id) {
  	document.getElementById(id).classList.toggle('selected');
};

/*
function openBeerList() {
	let list = document.getElementById('brand-list');
	list.style.height = "150px";
	list.style.overflowY = "scroll";
	list.style.paddingRight = list.offsetWidth - list.clientWidth + "px";
}
*/

/* blurraa kartan kun menu avataan */
function openMenu() {
    document.getElementById("side-menu").style.width = "300px";
    document.getElementById("menu-oof").style.width = "100%";
};

/* palauttaa kartan takaisin normaaliksi kun menu suljetaan */
function closeMenu() {
    document.getElementById("side-menu").style.width = "0";
    document.getElementById("menu-oof").style.width = "0";
};

/* blurraa kartan kun restaurant card avataan */
function openCard() {
    document.getElementById("restaurant-card").style.width = "600px";
    document.getElementById("card-oof").style.width = "100%";
};

/* palauttaa kartan takaisin normaaliksi kun restaurant card suljetaan */
function closeCard() {
    document.getElementById("restaurant-card").style.width = "0";
    document.getElementById("card-oof").style.width = "0";
}