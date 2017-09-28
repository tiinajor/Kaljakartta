import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

import org.apache.commons.collections.map.LinkedMap;

import com.tinkerpop.blueprints.Direction;
import com.tinkerpop.blueprints.Edge;
import com.tinkerpop.blueprints.Vertex;
import com.tinkerpop.blueprints.impls.orient.OrientGraphFactory;
import com.tinkerpop.blueprints.impls.orient.OrientGraphNoTx;
import com.tinkerpop.gremlin.Tokens.T;
import com.tinkerpop.gremlin.groovy.Gremlin;
import com.tinkerpop.gremlin.java.GremlinPipeline;
import com.tinkerpop.pipes.Pipe;
import com.tinkerpop.pipes.util.iterators.SingleIterator;

public class Dao {

	private static OrientGraphNoTx graph;
	private static OrientGraphFactory factory;

	public Dao(String address, String user, String pass) {

		factory = new OrientGraphFactory(address, user, pass);
		graph = factory.getNoTx();

	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	public static ArrayList<String> getBrands() {

		ArrayList<String> brands = new ArrayList<>();

		List<Vertex> beers = new GremlinPipeline(graph.getVerticesOfClass("Beer")).toList();

		for (Vertex v : beers) {

			if (!brands.contains(v.getProperty("brand"))) {

				brands.add(v.getProperty("brand"));

			}

		}

		return brands;

	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	public static ArrayList<String> getBeerTypes() {

		ArrayList<String> types = new ArrayList<>();

		List<Vertex> beers = new GremlinPipeline(graph.getVerticesOfClass("Beer")).toList();

		for (Vertex v : beers) {

			if (!types.contains(v.getProperty("type"))) {

				types.add(v.getProperty("type"));

			}

		}

		return types;

	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	public static HashMap getRestaurant(String name) {

		Vertex restaurant = graph.getVertices("Restaurant.name", name).iterator().next();

		Set<String> keys = restaurant.getPropertyKeys();

		HashMap restaurantValues = new HashMap();

		Iterator keyIter = keys.iterator();

		while (keyIter.hasNext()) {

			String key = keyIter.next().toString();

			restaurantValues.put(key, restaurant.getProperty(key));

		}

		return restaurantValues;

	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	public static HashMap<String, Double[]> filterRestaurants(HashMap keys) {

		HashMap restaurants = new HashMap();

		// if (keys.get("serving").equals("tap")) {

		// for (Vertex v : graph.getVertices("Beer.type", keys.get("type"))) {
		//
		//// if (v.getProperty("brand").equals(keys.get("brand")) &&
		// Double.parseDouble(v.getProperty("abv").toString()) <
		// Double.parseDouble(keys.get("abvMax").toString())
		//// && Double.parseDouble(v.getProperty("abv").toString()) >
		// Double.parseDouble(keys.get("abvMin").toString()))
		//
		// if (v.getProperty("brand").equals(keys.get("brand")) &&
		// Double.parseDouble(v.getProperty("abv").toString()) <
		// Double.parseDouble(keys.get("abvMax").toString())
		// && Double.parseDouble(v.getProperty("abv").toString()) >
		// Double.parseDouble(keys.get("abvMin").toString())) {
		//
		// List<Vertex> matches = new GremlinPipeline(v).out("Tap").toList();
		//
		// for (int i = 0; i < matches.size(); i++) {
		//
		// if (!restaurants.containsKey(matches.get(i).getProperty("name"))) {
		//
		// Double[] coordinates =
		// {Double.parseDouble(matches.get(i).getProperty("latitude").toString()),
		// Double.parseDouble(matches.get(i).getProperty("longitude").toString())};
		// restaurants.put(matches.get(i).getProperty("name"), coordinates);
		//
		// }
		//
		// }
		//
		// }

		// }

		// List<Vertex> beers = new
		// GremlinPipeline(graph.getVerticesOfClass("Beer")).toList();

		List<Vertex> beers = new ArrayList<>();
		beers = new GremlinPipeline(graph.getVerticesOfClass("Beer")).toList();

//		if (keys.containsKey("serving") && keys.get("serving") != "") {
//
//			for (Edge e : graph.getEdgesOfClass(keys.get("serving").toString())) {
//
//				if (Double.parseDouble(e.getProperty("price").toString()) <= Double
//						.parseDouble(keys.get("price").toString())) {
//					beers.add(e.getVertex(Direction.OUT));
//				}
//
//			}
//		} else {
//
//			for (Edge e : graph.getEdges()) {
//
//				if (Double.parseDouble(e.getProperty("price").toString()) <= Double
//						.parseDouble(keys.get("price").toString())) {
//					beers.add(e.getVertex(Direction.OUT));
//				}
//
//			}
//
//		}

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

			}

			edges = v.getEdges(Direction.OUT, "E").iterator();

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

		// System.out.println(matches);

		System.out.println("Success!\n");
		return restaurants;

	}

	public static void main(String[] args) {

		Dao dao = new Dao("remote:188.166.162.144:2424/KaljakarttaDB", "root", "juuriPassu");



		HashMap criteria = new HashMap();

		criteria.put("price", 10);
		criteria.put("abvMin", 3.0);
		criteria.put("abvMax", 7);
		criteria.put("type", "Lager");


		HashMap<String, Double[]> restaurants = filterRestaurants(criteria);

		Set keys = restaurants.keySet();
		System.out.println(keys);

		System.out.println("LAT: " + restaurants.get(keys.iterator().next())[0] + " LON: "
				+ restaurants.get(keys.iterator().next())[1]);

		System.out.println(getRestaurant("Boothill"));

		System.out.println(getBeerTypes());

		System.out.println(getBrands());

	}

}