package org.kaljakartta.fi.app.back;

import java.util.ArrayList;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

public interface DataAccessObject {

	/**
	 * 
	 * Queries the database for all beverage brands.
	 * 
	 * @return An array containing a list of all beverage types found in the
	 *         database
	 */
	ArrayList<String> getBrands();

	/**
	 * 
	 * Queries the database for all beverage types.
	 * 
	 * @return An array containing a list of all beverage types found in the
	 *         database
	 */
	ArrayList<String> getBeverageTypes();

	/**
	 * 
	 * Takes in the name of the restaurant as parameter, and queries the beverages
	 * from the database.
	 * 
	 * @param name
	 *            - The name of the restaurant
	 * @return An array containing the restaurants product list with beverages and
	 *         details.
	 */
	JSONArray getRestaurant(String name);

	/**
	 * 
	 * Takes in a path to a .json file containing an array of beverages as
	 * JSONObjects and writes them to the database if they do not already exist.
	 * 
	 * @param path
	 */
	void parseBeverages(String path);

	/**
	 * Takes in a path to a .json file containing an array of restaurants as
	 * JSONObjects, which contain an array of beverages as JSONObjects as parameter,
	 * and creates a record of each restaurant if needed and creates the relations
	 * between the restaurants and beverages listed in the file.
	 * 
	 * @param path
	 *            to .json file
	 */
	void linkRestaurants(String path);

	/**
	 * 
	 * Takes in a JSONObject map containing search parameters, queries the database
	 * for restaurants that match the criteria and returns an array containing the
	 * names of the matching restaurants.
	 * 
	 * @param params
	 *            - Search parameters as a JSONObject, with keys: 'types', 'brands',
	 *            'serving', 'abvMin', 'abvMax', 'price'.
	 * @return - An array containing the names of matching restaurants.
	 */
	JSONArray findRestaurants(JSONObject params);

}