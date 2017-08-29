window.onload = function(){
  const priceSlider = document.getElementById('price-slider');
  const alcoholSlider = document.getElementById('alcohol-slider');
  const distanceSlider = document.getElementById('distance-slider');


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
    start: [ 0, 4.7 ],
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
    document.getElementById("distance").innerHTML = value;
  });


}




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
}

/* blurraa kartan kun menu avataan */
function openMenu() {
    document.getElementById("mobile-menu").style.width = "250px";
    document.getElementById("map").style.filter = "blur(2px)";
    document.getElementById("search-container").style.filter = "blur(2px)";
    document.getElementById("title-container").style.filter = "blur(2px)";
}

/* palauttaa kartan takaisin normaaliksi kun menu suljetaan */
function closeMenu() {
    document.getElementById("mobile-menu").style.width = "0";
    document.getElementById("map").style.filter = "blur(0px)";
    document.getElementById("search-container").style.filter = "blur(0px)";
    document.getElementById("title-container").style.filter = "blur(0px)";
}