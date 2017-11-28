package org.kaljakartta.fi.app.back;


import org.json.simple.JSONObject;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;


@CrossOrigin(origins = "*")
@Controller
@RestController
public class RESTController {

	private Dao dao = new Dao("remote:188.166.162.144:2424/KaljakarttaDB", "dao", "bakkiPassu");

	@RequestMapping(value = "/restaurant", method = RequestMethod.GET)
	public @ResponseBody String passRestaurants(@RequestParam String name) {

		return dao.getRestaurant(name).toString();

	}

	@RequestMapping(value = "/beertypes", method = RequestMethod.GET)
	public @ResponseBody String passTypes() {

		String ret = dao.getBeerTypes().toString();
		return ret;

	}

	@RequestMapping(value = "/brands", method = RequestMethod.GET)
	public @ResponseBody String passBrands() {

		String ret = dao.getBrands().toString();
		return ret;

	}

	@RequestMapping(value = "/findrestaurants", method = RequestMethod.POST, consumes="application/json")
	public @ResponseBody String findRestaurants(@RequestBody JSONObject keys) {

		return dao.findRestaurants(keys).toString();
	}

}