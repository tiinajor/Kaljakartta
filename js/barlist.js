window.onload = function() {

  // Initialize the activityNumber
  var activityNumber = 2;

  // Select the add_activity button
  var addButton = document.getElementById("add_activity");

  // Select the table element
  var tracklistTable = document.getElementById("tracklist");

  // Attach handler to the button click event
  addButton.onclick = function() {

  // Add a new row to the table using the correct activityNumber
      tracklistTable.innerHTML += '<tr class="input"><td id="counter">'+activityNumber+'</td><td><select class="input" required><option disabled selected value>Valitse juoma</option><option>Aura</option><option>Karhu III</option><option>Karhu IV</option><option>Karjala III</option><option>Karjala IV</option></select></td><td><input type="text" name="actlog1" class="input" placeholder="Syötä hinta" required></td><td><input type="text" name="time1" class="input" placeholder="Syötä koko" required></td><td><select class="input" required><option>Pullo</option><option>Hana</option></select></td></tr>';

    // Increment the activityNumber
    activityNumber += 1;
  }

}
