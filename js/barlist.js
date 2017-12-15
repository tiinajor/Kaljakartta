window.onload = function() {

  // Initialize the activityNumber
var activityNumber = 2;
var addButton = document.getElementById("add_beverage");
var tracklistTable = document.getElementById("tracklist");



fetch("http://188.166.162.144:130/brands")
	.then(response => {
	return response.text();
	})
	.then(data => {
		let beerBrands = data.slice(1, -1).split(",");
		beerBrands = beerBrands.map(x => x.trim());
		beerBrands.sort( function( a, b ) {
			a = a.toLowerCase();
			b = b.toLowerCase();
			return a < b ? -1 : a > b ? 1 : 0;
		});

		let html = `<option disabled selected>Valitse Brändi</option>`;
		for (let brand of beerBrands){
			html += `<option value="${brand}">${brand}</option>`
		}
		document.getElementById("selectBrand").innerHTML = html;

	})
	.catch(err => console.log("Fetch Error: " + err));
}
