package org.kaljakartta.fi.app.back;

import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

//import org.json.simple.JSONArray;
//import org.json.simple.JSONObject;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import com.tinkerpop.blueprints.Direction;
import com.tinkerpop.blueprints.Edge;
import com.tinkerpop.blueprints.Vertex;
import com.tinkerpop.blueprints.impls.orient.OrientGraphFactory;
import com.tinkerpop.blueprints.impls.orient.OrientGraphNoTx;
import com.tinkerpop.gremlin.Tokens.T;
import com.tinkerpop.gremlin.java.GremlinPipeline;

public class Dao implements DataAccessObject {

	private static OrientGraphFactory factory;
	private static OrientGraphNoTx graph;

	public Dao(String address, String user, String pass) {

		System.out.println("New Dao object created");
		factory = new OrientGraphFactory(address, user, pass).setupPool(1, 10);
		graph = factory.getNoTx();

	}


	@Override
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

	@Override
	@SuppressWarnings({ "rawtypes", "unchecked" })
	public ArrayList<String> getNames() {

		ArrayList<String> names = new ArrayList();

		List<Vertex> beers = new GremlinPipeline(graph.getVertices("Beer.beer", true)).toList();

		for (Vertex v : beers) {

			if (!names.contains(v.getProperty("name"))) {

				names.add(v.getProperty("name").toString());

			}

		}

		return names;

	}


	@Override
	@SuppressWarnings({ "rawtypes", "unchecked" })
	public ArrayList<String> getBeverageTypes() {

		ArrayList<String> types = new ArrayList();

		List<Vertex> beers = new GremlinPipeline(graph.getVertices("Beer.beer", true)).toList();

		for (Vertex v : beers) {

			if (!types.contains(v.getProperty("type"))) {

				types.add(v.getProperty("type").toString());

			}

		}

		return types;

	}


	@Override
	@SuppressWarnings("unchecked")
	public JSONArray getRestaurant(String name) {

		try {

			JSONArray restaurantValues = new JSONArray();

			Iterator<Edge> tap = graph.getVertices("Restaurant.name", name).iterator().next()
					.getEdges(Direction.IN, "Tap").iterator();

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


	@Override
	public void parseBeverages(String path) {

		try {
			JSONParser parser = new JSONParser();

			JSONArray array = (JSONArray) parser.parse(new FileReader(path));

			for (Object o : array) {

				JSONObject json = (JSONObject) o;

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


	@Override
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


	@Override
	@SuppressWarnings({ "rawtypes", "unchecked" })
	public JSONArray findRestaurants(JSONObject params) {

		JSONArray restaurants = new JSONArray();

		if (params.get("types").toString().equals("[]") || params.get("types").toString().isEmpty())
			params.put("types", this.getBeverageTypes());

		if (params.get("brands").toString().equals("[]") || params.get("brands").toString().isEmpty())
			params.put("brands", this.getBrands());

		if (params.get("serving".toString()).equals("Both")) {
			System.out.println("Both");
			List<Vertex> beers = new GremlinPipeline(graph.getVertices("Beer.beer", true))
					.has("type", T.in, params.get("types")).has("brand", T.in, params.get("brands"))
					.has("abv", T.gte, Double.parseDouble(params.get("abvMin").toString()))
					.has("abv", T.lte, Double.parseDouble(params.get("abvMax").toString())).outE()
					.has("price", T.lte, Double.parseDouble(params.get("price").toString())).inV().toList();

			for (Vertex v : beers) {
				if (!restaurants.contains(v.getProperty("name").toString()))
					restaurants.add(v.getProperty("name").toString());
			}

		} else {
			System.out.println(params.get("serving").toString());
			List<Vertex> beers = new GremlinPipeline(graph.getVertices("Beer.beer", true))
					.has("type", T.in, params.get("types")).has("brand", T.in, params.get("brands"))
					.has("abv", T.gte, Double.parseDouble(params.get("abvMin").toString()))
					.has("abv", T.lte, Double.parseDouble(params.get("abvMax").toString()))
					.outE(params.get("serving").toString())
					.has("price", T.lte, Double.parseDouble(params.get("price").toString())).inV().toList();

			for (Vertex v : beers) {
				if (!restaurants.contains(v.getProperty("name").toString()))
					restaurants.add(v.getProperty("name").toString());
			}
		}

		return restaurants;

	}

}
