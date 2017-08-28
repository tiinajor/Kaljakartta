function initMap() {
  var position = {lat: 60.170618, lng: 24.941118};
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

function openMenu() {
    document.getElementById("mobile-menu").style.width = "250px";
}

function closeMenu() {
    document.getElementById("mobile-menu").style.width = "0";
}