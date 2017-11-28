package org.kaljakartta.fi.app.back;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;

import org.json.simple.JSONArray;
import org.json.JSONException;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.springframework.util.SystemPropertyUtils;

import com.tinkerpop.blueprints.Direction;
import com.tinkerpop.blueprints.Edge;
import com.tinkerpop.blueprints.Vertex;
import com.tinkerpop.blueprints.impls.orient.OrientGraphFactory;
import com.tinkerpop.blueprints.impls.orient.OrientGraphNoTx;
import com.tinkerpop.gremlin.Tokens.T;
import com.tinkerpop.gremlin.java.GremlinPipeline;

public class Dao {

	private static OrientGraphFactory factory;
	private static OrientGraphNoTx graph;

	public Dao(String address, String user, String pass) {

		System.out.println("New Dao object created");
		factory = new OrientGraphFactory(address, user, pass).setupPool(0, 20);
		graph = factory.getNoTx();

	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	public ArrayList<String> getBrands() {

		ArrayList<String> brands = new ArrayList();

		List<Vertex> beers = new GremlinPipeline(graph.getVertices("Beer.beer", true)).toList();

		for (Vertex v : beers) {

			if (!brands.contains(v.getProperty("brand"))) {

				brands.add(v.getProperty("brand").toString());

			}

		}

		return brands;

	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	public ArrayList<String> getBeerTypes() {

		ArrayList<String> types = new ArrayList();

		List<Vertex> beers = new GremlinPipeline(graph.getVertices("Beer.beer", true)).toList();

		for (Vertex v : beers) {

			if (!types.contains(v.getProperty("type"))) {

				types.add(v.getProperty("type").toString());

			}

		}

		return types;

	}

	public JSONArray getRestaurant(String name) {

		try {
			// Vertex restaurant = graph.getVertices("Restaurant.name",
			// name).iterator().next();

			// HashMap<String, HashMap<String, Double>> restaurantValues = new
			// HashMap();
			JSONArray restaurantValues = new JSONArray();

			// Iterator keyIter = keys.iterator();

			Iterator<Edge> tap = graph.getVertices("Restaurant.name", name).iterator().next()
					.getEdges(Direction.IN, "Tap").iterator();

			// HashMap<String, Double> tapName = new HashMap();

			if (tap.hasNext()) {

				while (tap.hasNext()) {

					JSONObject tapBev = new JSONObject();

					Edge e = tap.next();
					Vertex bev = e.getVertex(Direction.OUT);

					tapBev.put("name", bev.getProperty("name").toString());
					tapBev.put("serving", "tap");
					try {
						double price = e.getProperty("price");
						tapBev.put("price", price);
					} catch (Exception e1) {
						tapBev.put("price", Double.MAX_VALUE);
						System.out.println("No price found for: Tap - " + bev.getProperty("name"));
					}
					try {
						double vol = e.getProperty("vol");
						tapBev.put("vol", vol);
					} catch (Exception e1) {
						tapBev.put("vol", Double.MAX_VALUE);
						System.out.println("No vol found for: Tap - " + bev.getProperty("name"));
					}
					try {
						tapBev.put("abv", bev.getProperty("abv").toString());
					} catch (Exception e1) {
						tapBev.put("abv", Double.MAX_VALUE);
						System.out.println("No abv found for: Tap - " + bev.getProperty("name"));
					}
					try {
						tapBev.put("type", bev.getProperty("type").toString());
					} catch (Exception e1) {
						tapBev.put("type", 0);
						System.out.println("No type found for: Tap - " + bev.getProperty("name"));
					}

					restaurantValues.add(tapBev);

				}

			} else
				System.out.println("No Tap beverages found for: " + name);

			Iterator<Edge> bottle = graph.getVertices("Restaurant.name", name).iterator().next()
					.getEdges(Direction.IN, "Bottle").iterator();

			// HashMap<String, Double> botName = new HashMap();

			if (bottle.hasNext()) {

				while (bottle.hasNext()) {

					JSONObject botBev = new JSONObject();

					Edge e = bottle.next();
					Vertex bev = e.getVertex(Direction.OUT);

					botBev.put("name", bev.getProperty("name").toString());
					botBev.put("serving", "bottle");
					try {
						double price = e.getProperty("price");
						botBev.put("price", price);
					} catch (Exception e1) {
						botBev.put("price", Double.MAX_VALUE);
						System.out.println("No price found for: Bottle - " + bev.getProperty("name"));
					}
					try {
						double vol = e.getProperty("vol");
						botBev.put("vol", vol);
					} catch (Exception e1) {
						botBev.put("vol", Double.MAX_VALUE);
						System.out.println("No vol found for: Bottle - " + bev.getProperty("name"));
					}
					try {
						botBev.put("abv", bev.getProperty("abv").toString());
					} catch (Exception e1) {
						botBev.put("abv", Double.MAX_VALUE);
						System.out.println("No abv found for: Bottle - " + bev.getProperty("name"));
					}
					try {
						botBev.put("type", bev.getProperty("type").toString());
					} catch (Exception e1) {
						botBev.put("type", 0);
						System.out.println("No type found for: Bottle - " + bev.getProperty("name"));
					}

					restaurantValues.add(botBev);

				}

			} else
				System.out.println("No Bottle beverages found for: " + name);

			return restaurantValues;

		} catch (Exception e) {
			e.printStackTrace();
			return new JSONArray();
		}

	}


	public void parseBeers(String path) {

		try {
			JSONParser parser = new JSONParser();

			JSONArray array = (JSONArray) parser.parse(new FileReader(path));

			for (Object o : array) {

				JSONObject json = (JSONObject) o;

				// if (!json.get("Abv").equals("") && !json.get("Abv").toString().contains("?")
				// && !json.get("Abv").toString().contains("-")) {
				// String abv = json.get("Abv").toString();
				// System.out.println(abv);
				// String abv2 = abv.replace(',', '.');
				// System.out.println(abv2);
				// }
				// Double abvCast = Double.parseDouble(abv);
				// System.out.println(json.get("Brand") + ", " + json.get("Name")+", "+
				// json.get("Type")+", "+json.get("Abv"));
				// Double abv = Double.parseDouble(json.get("Abv").toString());
				// System.out.println(abv);
				// System.out.println(abvCast);
				if (!graph.getVertices("Beer.name", json.get("Name")).iterator().hasNext())
					graph.addVertex("class:Beer", "beer", true, "brand", json.get("Brand"), "type", json.get("Type"),
							"abv", json.get("Abv"), "name", json.get("Name"));
				else
					System.out.println("Duplicate on: " + json.get("Name"));

			}

		} catch (IOException | ParseException e) {
			e.printStackTrace();
		}

	}

	public void linkRestaurants(String path) {

		JSONParser parser = new JSONParser();

		try {

			JSONArray restaurantArray = (JSONArray) parser.parse(new FileReader(path));

			for (Object o : restaurantArray) {

				JSONObject restaurantJson = (JSONObject) o;

				Vertex restaurant;

				if (graph.getVertices("Restaurant.name", restaurantJson.get("Name")).iterator().hasNext())
					restaurant = graph.getVertices("Restaurant.name", restaurantJson.get("Name")).iterator().next();
				else
					restaurant = graph.addVertex("class:Restaurant", "name", restaurantJson.get("Name"));

				JSONArray beverageArray = (JSONArray) restaurantJson.get("Beverages");

				for (Object beverage : beverageArray) {

					JSONObject beverageJson = (JSONObject) beverage;

					ArrayList<String> beverages = new ArrayList<>();

					graph.getVertices("Restaurant.name", restaurantJson.get("Name")).iterator().next()
							.getEdges(Direction.IN, beverageJson.get("Serving").toString()).forEach(e -> {
								beverages.add(e.getVertex(Direction.OUT).getProperty("name"));
							});
					;

					if (graph.getVertices("Beer.name", beverageJson.get("Name")).iterator().hasNext()) {

						if (!beverages.contains(beverageJson.get("Name"))) {
							Edge edge = graph.addEdge(null,
									graph.getVertices("Beer.name", beverageJson.get("Name")).iterator().next(),
									restaurant, beverageJson.get("Serving").toString());

							String price = beverageJson.get("Price").toString();

							if (!beverageJson.get("Price").toString().contains("\"")) {
								price = price.replaceAll("\"", "");
								price = price.replace(',', '.');
							} else
								price = price.replace(',', '.');

							if (!price.equals("") && !price.isEmpty())
								edge.setProperty("price", Double.parseDouble(price));

							String vol = beverageJson.get("Vol").toString();

							if (!beverageJson.get("Vol").toString().contains("\"")) {
								vol = vol.replaceAll("\"", "");
								vol = vol.replace(',', '.');
							} else
								vol = vol.replace(',', '.');

							if (!vol.equals("") && !vol.isEmpty())
								edge.setProperty("vol", Double.parseDouble(vol));
						} else
							System.out.println("Duplicate on restaurant: " + restaurantJson.get("Name") + ", Beverage: "
									+ beverageJson.get("Name"));
					} else {
						System.out.println("Couldn't find beverage " + beverageJson.get("Name")
								+ " from DB, Restaurant: " + restaurantJson.get("Name"));
					}
				}
			}

		} catch (IOException |

				ParseException e) {
			e.printStackTrace();
		}

	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	public JSONArray findRestaurants(JSONObject params) {

		JSONArray restaurants = new JSONArray();

		if (params.get("types").toString().isEmpty())
			params.put("types", this.getBeerTypes());

		if (params.get("brands").toString().isEmpty())
			params.put("brands", this.getBrands());

		if (params.get("serving".toString()).equals("Both")) {
			System.out.println("Both");
			List<Vertex> beers = new GremlinPipeline(graph.getVertices("Beer.beer", true))
					.has("type", T.in, params.get("types")).has("brand", T.in, params.get("brands"))
					.has("abv", T.gte, params.get("abvMin")).has("abv", T.lte, params.get("abvMax"))
					.outE().has("price", T.lte, params.get("price")).inV().toList();

			for (Vertex v : beers) {
				if(!restaurants.contains(v.getProperty("name").toString()))
					restaurants.add(v.getProperty("name").toString());
			}
			
		} else {
			System.out.println(params.get("serving").toString());
			List<Vertex> beers = new GremlinPipeline(graph.getVertices("Beer.beer", true))
					.has("type", T.in, params.get("types")).has("brand", T.in, params.get("brands"))
					.has("abv", T.gte, params.get("abvMin")).has("abv", T.lte, params.get("abvMax"))
					.outE(params.get("serving").toString()).has("price", T.lte, params.get("price")).inV().toList();
			
			for (Vertex v : beers) {
				if(!restaurants.contains(v.getProperty("name").toString()))
					restaurants.add(v.getProperty("name").toString());
			}
		}

		return restaurants;

	}

	public static void main(String[] args) {
		Dao dao = new Dao("remote:188.166.162.144:2424/KaljakarttaDB", "dao", "bakkiPassu");
		// dao.parseBeers("F:/Downloads/beers2.json");
		// dao.linkRestaurants("F:/Downloads/restaurants.json");
		JSONObject params = new JSONObject();
		JSONArray types = new JSONArray();
		JSONArray brands = new JSONArray();

		types.add("Lager,Lager");
		types.add("IPA,IPA");
		brands.add("Lapin Kulta");
		brands.add("Karhu");
		brands.add("Karjala");

		params.put("types", types);
		params.put("brands", brands);
		params.put("price", 8.0);
		params.put("abvMin", 3.0);
		params.put("abvMax", 15.0);
		params.put("serving", "Both");

		System.out.println(params);

		System.out.println(dao.findRestaurants(params));
	}

}
