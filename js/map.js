var hki = {lat: 60.162786, lng: 24.932607};
var map;
var pos;
var infoWindow;

function initMap() {
        map = new google.maps.Map(document.getElementById('map'), {
          center: hki,
          zoom: 14,
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
        
        
        infoWindow = new google.maps.InfoWindow;

        // Try HTML5 geolocation.
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };

            infoWindow.setPosition(pos);
            infoWindow.setContent('Location found.');
            infoWindow.open(map);
            map.setCenter(pos);
          }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
          });
        } else {
          // Browser doesn't support Geolocation
          handleLocationError(false, infoWindow, map.getCenter());
        }

        
}

function callback(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
    	console.log(results);
		for (var i = 0; i < results.length; i++) {
			createMarker(results[i]);
		}
    }
}

function createMarker(place) {
	var placeLoc = place.geometry.location;
	var marker = new google.maps.Marker({
		map: map,
		position: place.geometry.location
	});

	google.maps.event.addListener(marker, 'click', function() {
		var open = "Suljettu";
		if (place.opening_hours.open_now) {
			open = "Avoinna nyt";
		}
		document.getElementById('bar-name').innerHTML = place.name;
		document.getElementById('bar-address').innerHTML = place.vicinity;
		document.getElementById('bar-desc').innerHTML = "Vittusaatana tää toimii";
		/*
		infoWindow.setContent(place.name + " " + place.vicinity + " " + open);
		infoWindow.open(map, this);
		*/
		openCard();
});


      function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
                              'Error: The Geolocation service failed.' :
                              'Error: Your browser doesn\'t support geolocation.');
        infoWindow.open(map);
      }

  }

