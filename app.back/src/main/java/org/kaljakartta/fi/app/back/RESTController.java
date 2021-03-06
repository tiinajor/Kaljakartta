package org.kaljakartta.fi.app.back;

import org.json.simple.JSONObject;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * 
 * Receives REST HTTP requests and calls methods accordingly
 * 
 * @author Akisa
 *
 */
@CrossOrigin(origins = "*")
@Controller
@RestController
public class RESTController {

	private DataAccessObject dao = new Dao("address", "user", "password");

	/**
	 * 
	 * Relays the name of the restaurant and returns restaurant info.
	 * 
	 * @param name - Name of the restaurant
	 * @return An array containing the restaurants product list with beverages and details.
	 */
	@Async
	@RequestMapping(value = "/restaurant", method = RequestMethod.GET)
	public @ResponseBody String passRestaurants(@RequestParam String name) {

		return dao.getRestaurant(name).toString();

	}

	/**
	 * 
	 * Returns beverage types by request.
	 * 
	 * @return An array containing a list of all beverage types found in the database.
	 */
	@Async
	@RequestMapping(value = "/beveragetypes", method = RequestMethod.GET)
	public @ResponseBody String passTypes() {

		String ret = dao.getBeverageTypes().toString();
		return ret;

	}

	/**
	 * 
	 * Returns beverage brands by request.
	 * 
	 * @return An array containing a list of all beverage types found in the database
	 */
	@Async
	@RequestMapping(value = "/brands", method = RequestMethod.GET)
	public @ResponseBody String passBrands() {

		String ret = dao.getBrands().toString();
		return ret;

	}
	
	/**
	 * 
	 * Returns beverage names by request.
	 * 
	 * @return An array containing a list of all beverage names found in the database
	 */
	@Async
	@RequestMapping(value = "/beveragenames", method = RequestMethod.GET)
	public @ResponseBody String passNames() {

		String ret = dao.getNames().toString();
		return ret;

	}

	/**
	 * 
	 * Relays search parameters and returns a list of matching restaurants.
	 * 
	 * @param params - Search parameters as a JSONObject, with keys: 'types', 'brands', 'serving', 'abvMin', 'abvMax', 'price'.
	 * @return An array containing the names of matching restaurants.
	 */
	@Async
	@RequestMapping(value = "/findrestaurants", method = RequestMethod.POST, consumes = "application/json")
	public @ResponseBody String findRestaurants(@RequestBody JSONObject params) {

		return dao.findRestaurants(params).toString();
	}

}