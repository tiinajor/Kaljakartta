package org.kaljakartta.fi.app.back;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.tinkerpop.blueprints.Direction;
import com.tinkerpop.blueprints.Edge;
import com.tinkerpop.blueprints.Vertex;
import com.tinkerpop.blueprints.impls.orient.OrientGraphFactory;
import com.tinkerpop.blueprints.impls.orient.OrientGraphNoTx;
import com.tinkerpop.gremlin.java.GremlinPipeline;

public class Dao {

	private static OrientGraphFactory factory;
	private static OrientGraphNoTx graph;

	public Dao(String address, String user, String pass) {

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

			while (tap.hasNext()) {

				JSONObject tapBev = new JSONObject();

				Edge e = tap.next();
				double price = e.getProperty("price");
				double vol = e.getProperty("vol");
				Vertex bev = e.getVertex(Direction.OUT);

				tapBev.put("name", bev.getProperty("name").toString());
				tapBev.put("serving", "tap");
				tapBev.put("price", price);
				tapBev.put("vol", vol);
				tapBev.put("abv", bev.getProperty("abv").toString());
				tapBev.put("type", bev.getProperty("type").toString());

				restaurantValues.put(tapBev);

			}

			Iterator<Edge> bottle = graph.getVertices("Restaurant.name", name).iterator().next()
					.getEdges(Direction.IN, "Bottle").iterator();

			// HashMap<String, Double> botName = new HashMap();

			while (bottle.hasNext()) {

				JSONObject botBev = new JSONObject();

				Edge e = bottle.next();
				double price = e.getProperty("price");
				double vol = e.getProperty("vol");
				Vertex bev = e.getVertex(Direction.OUT);

				botBev.put("name", bev.getProperty("name").toString());
				botBev.put("serving", "bottle");
				botBev.put("price", price);
				botBev.put("vol", vol);
				botBev.put("abv", bev.getProperty("abv").toString());
				botBev.put("type", bev.getProperty("type").toString());

				restaurantValues.put(botBev);

			}

			return restaurantValues;

		} catch (Exception e) {

			return null;
		}

	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	public HashMap<String, Double[]> filterRestaurants(JSONObject params) {

		HashMap restaurants = new HashMap();
		HashMap keys = new HashMap();

		params.keys().forEachRemaining(k -> {
			try {
				keys.put(k.toString(), params.get(k.toString()));
			} catch (JSONException e) {
				e.printStackTrace();
			}
		});

		List<Vertex> beers = new ArrayList();
		beers = new GremlinPipeline(graph.getVertices("Beer.beer", true)).toList();

		for (int i = 0; i < beers.size(); i++) {

			if (keys.containsKey("type") && !beers.get(i).getProperty("type").equals(keys.get("type"))) {

				beers.remove(beers.get(i));

			}

			if (keys.containsKey("brand") && !beers.get(i).getProperty("brand").equals(keys.get("brand"))) {

				beers.remove(beers.get(i));

			}

			if (Double.parseDouble(beers.get(i).getProperty("abv").toString()) < Double
					.parseDouble(keys.get("abvMin").toString())
					&& Double.parseDouble(beers.get(i).getProperty("abv").toString()) > Double
							.parseDouble(keys.get("abvMax").toString())) {

				beers.remove(beers.get(i));

			}

		}

		Iterator<Edge> edges;

		for (Vertex v : beers) {

			System.out.println("Alku: " + beers);

			if (keys.containsKey("serving") && !keys.get("serving").equals("")) {

				edges = v.getEdges(Direction.OUT, keys.get("serving").toString()).iterator();

			} else {
				edges = v.getEdges(Direction.OUT, "E").iterator();
			}

			System.out.println("Menossa Whileen: " + edges);

			while (edges.hasNext()) {

				Edge e = edges.next();

				System.out.println(e);

				System.out.println(e.getPropertyKeys());
				System.out.println(e.getLabel());

				if (Double.parseDouble(e.getProperty("price").toString()) <= Double
						.parseDouble(keys.get("price").toString())) {

					Vertex restaurant = e.getVertex(Direction.IN);

					Double[] coordinates = { Double.parseDouble(restaurant.getProperty("latitude").toString()),
							Double.parseDouble(restaurant.getProperty("longitude").toString()) };

					restaurants.put(restaurant.getProperty("name"), coordinates);

				}

			}

		}

		System.out.println("Success!\n");
		return restaurants;

	}

}
