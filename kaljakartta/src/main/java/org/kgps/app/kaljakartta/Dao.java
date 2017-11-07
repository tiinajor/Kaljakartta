package org.kgps.app.kaljakartta;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import com.tinkerpop.blueprints.Direction;
import com.tinkerpop.blueprints.Edge;
import com.tinkerpop.blueprints.Vertex;
import com.tinkerpop.blueprints.impls.orient.OrientGraphFactory;
import com.tinkerpop.blueprints.impls.orient.OrientGraphNoTx;
import com.tinkerpop.gremlin.java.GremlinPipeline;


public class Dao {

	private static OrientGraphFactory factory = new OrientGraphFactory("remote:188.166.162.144:2424/KaljakarttaDB", "dao", "bakkiPassu");
	private static OrientGraphNoTx graph = factory.getNoTx();


	public Dao(String address, String user, String pass) {

		factory = new OrientGraphFactory("remote:188.166.162.144:2424/KaljakarttaDB", "dao", "bakkiPassu");
		graph = factory.getNoTx();

	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	public static ArrayList<String> getBrands() {

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
	public static ArrayList<String> getBeerTypes() {

		ArrayList<String> types = new ArrayList();

		List<Vertex> beers = new GremlinPipeline(graph.getVertices("Beer.beer", true)).toList();

		for (Vertex v : beers) {

			if (!types.contains(v.getProperty("type"))) {

				types.add(v.getProperty("type").toString());

			}

		}

		return types;

	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	public static String getRestaurant(String name) {

		try {
//			Vertex restaurant = graph.getVertices("Restaurant.name", name).iterator().next();

			HashMap<String, HashMap<String, Double>> restaurantValues = new HashMap();

//			Iterator keyIter = keys.iterator();

			Iterator<Edge> tap = graph.getVertices("Restaurant.name", name).iterator().next().getEdges(Direction.IN, "Tap").iterator();

			HashMap<String, Double> tapName = new HashMap();

			while (tap.hasNext()) {

				Edge e = tap.next();
				double price = e.getProperty("price");
				Vertex bev = e.getVertex(Direction.OUT);

				tapName.put(bev.getProperty("name").toString(), price);


			}

			restaurantValues.put("tap", tapName);


			Iterator<Edge> bottle = graph.getVertices("Restaurant.name", name).iterator().next().getEdges(Direction.IN, "Bottle").iterator();

			HashMap<String, Double> botName = new HashMap();

			while (bottle.hasNext()) {

				Edge e = tap.next();
				double price = e.getProperty("price");
				Vertex bev = e.getVertex(Direction.OUT);

				botName.put(bev.getProperty("name").toString(), price);


			}

			restaurantValues.put("bottle", botName);

			return restaurantValues.toString();

		} catch (Exception e) {

			return "Not Found";
		}


	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	public static HashMap<String, Double[]> filterRestaurants(HashMap keys) {

		HashMap restaurants = new HashMap();

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

			System.out.println("Alku: "+ beers);

			if (keys.containsKey("serving") && !keys.get("serving").equals("")) {

				edges = v.getEdges(Direction.OUT, keys.get("serving").toString()).iterator();

			} else {
				edges = v.getEdges(Direction.OUT, "E").iterator();
			}

			System.out.println("Menossa Whileen: "+edges);

			while (edges.hasNext()) {

				Edge e = edges.next();

				System.out.println(e);

				System.out.println(e.getPropertyKeys());
				System.out.println(e.getLabel());

				if (Double.parseDouble(e.getProperty("price").toString()) <= Double.parseDouble(keys.get("price").toString())) {

					Vertex restaurant = e.getVertex(Direction.IN);

					Double[] coordinates = {Double.parseDouble(restaurant.getProperty("latitude").toString()), Double.parseDouble(restaurant.getProperty("longitude").toString())};

					restaurants.put(restaurant.getProperty("name"), coordinates);

				}

			}

		}


		System.out.println("Success!\n");
		return restaurants;

	}

}
