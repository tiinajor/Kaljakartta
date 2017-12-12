window.onload = function() {

  // Initialize the activityNumber
  var activityNumber = 2;

  // Select the add_activity button
  var addButton = document.getElementById("add_beverage");

  // Select the table element
  var tracklistTable = document.getElementById("tracklist");

  // Attach handler to the button click event
  addButton.onclick = function() {

  // Add a new row to the table using the correct activityNumber
      tracklistTable.innerHTML += '<tr class="input"><td class="bev_number" id="counter">'+activityNumber+'</td><td><select class="input" required><option disabled selected value>Valitse juoma</option><option>Aura</option><option>Karhu III</option><option>Karhu IV</option><option>Karjala III</option><option>Karjala IV</option></select></td><td><input type="text" name="actlog1" class="input" placeholder="Syötä hinta" required></td><td><input type="text" name="time1" class="input" placeholder="Syötä koko" required></td><td><select class="input" required><option>Pullo</option><option>Hana</option></select></td><td class="img"><img src="kgps_icons/x.svg" alt="X"/></td></tr>';

    // Increment the activityNumber
    activityNumber += 1;
  }


  //Populate brands-list
  setTimeout(() => {
    fetch("http://188.166.162.144:130/brands")
      .then(response => {
        return response.text();
      })
      .then(data => {
        let beerBrands = data.slice(1, -1).split(",");
        beerBrands = beerBrands.map(x => x.trim());

        // Sort alpabetically *Basically magic*
        beerBrands.sort( function( a, b ) {
            a = a.toLowerCase();
            b = b.toLowerCase();

            return a < b ? -1 : a > b ? 1 : 0;
        });

        html = "<option disabled selected value>" + "Valitse Juoma" + "</option>";
        for (var key in beerBrands){
          html += "<option value=" + key  + ">" +beerBrands[key] + "</option>"
        }
        document.getElementById("datas").innerHTML = html;
        // console.log(beerBrands);

      })
      .catch(err => console.log("Fetch Error: " + err));
  }, 750);

  var deleteBev = document.getElementById('img');

  deleteBev.onclick = function(){
    console.log("test");
  }
}
