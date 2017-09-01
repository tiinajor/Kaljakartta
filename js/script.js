window.onload = function(){
	const menuButton = document.getElementById('hamburger-menu');
	const priceSlider = document.getElementById('price-slider');
	const alcoholSlider = document.getElementById('alcohol-slider');
	const distanceSlider = document.getElementById('distance-slider');
	const tapButton = document.getElementById('tapButton');
	const bottleButton = document.getElementById('bottleButton');
	const brandList = document.getElementById('brand-list');
	const typeList = document.getElementById('type-list');
	const brandDiv = brandList.children[0];
	const typeDiv = typeList.children[0];

	let beerBrands = ["karhu", "koff", "karjala", "lapin kulta", "ale cog", "heineken", "pirkka"];
	let beerTypes = ["lager", "IPA", "Bock", "Stout", "porter", "pilsner"];


	createList(beerBrands, brandList);
	createList(beerTypes, typeList);


	// hanat mukana haussa kyllä/ei
	tapButton.onclick = function() {
		tapButton.classList.toggle('selected');
	};

	// pullot mukana haussa kyllä/ei
	bottleButton.onclick = function() {
		bottleButton.classList.toggle('selected');
	};



	// avaa merkit-listan ja sulkee oluttyypit-listan
	brandDiv.onclick = function() {
		console.log("brand click");
		let thisList = brandList.children[1];
		let thisDiv = brandList.children[0];
		let icon = thisDiv.children[0];

		toggleVisible(thisList);
		closeOtherList(typeList);
		rotateIcon(icon);
	};

	// avaa oluttyypit-listan ja sulkee merkit-listan
	typeDiv.onclick = function() {
		console.log("type click");
		let thisList = typeList.children[1];
		let otherList = brandList.children[1];
		let icon = typeDiv.children[0];
		toggleVisible(thisList);
		closeOtherList(brandList);
		rotateIcon(icon);
	};

	// menun avaus mobiilissa
	menuButton.onclick = function() {
		openMenu();
	} 

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

// luo menuun listan kaljamerkeistä
function createList(brands, parentDiv) {
	const ul = document.createElement('ul');
	
	for (var i = 0; i<brands.length; i++) {
		let li = document.createElement('li');
		let content = document.createTextNode(capitalizeFirstLetter(brands[i]));
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

function toggleVisible(item){
    if (item.style.display === 'block'){
        item.style.display = 'none';
    }else{
        item.style.display = 'block';
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

	otherList.style.display = 'none';
	icon.style.transform = "rotate(90deg)";
};


function toggleActive(id) {
  	document.getElementById(id).classList.toggle('selected');
};


/* blurraa kartan kun menu avataan */
function openMenu() {
    document.getElementById("mobile-menu").style.width = "300px";
    document.getElementById("out-of-focus-area").style.width = "100%";
};

/* palauttaa kartan takaisin normaaliksi kun menu suljetaan */
function closeMenu() {
    document.getElementById("mobile-menu").style.width = "0";
    document.getElementById("out-of-focus-area").style.width = "0";
};