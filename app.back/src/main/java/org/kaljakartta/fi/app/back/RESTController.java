package org.kaljakartta.fi.app.back;

import org.springframework.web.bind.annotation.RestController;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;


@Controller
@RestController
public class RESTController {

	private Dao dao = new Dao("remote:188.166.162.144:2424/KaljakarttaDB", "dao", "bakkiPassu");

//	@CrossOrigin(origins = "*")
	@RequestMapping(value = "/restaurant", method = RequestMethod.GET)
	public @ResponseBody String passRestaurants(@RequestParam String name) {

		return dao.getRestaurant(name).toString();

	}
//	@CrossOrigin(origins = "*")
	@RequestMapping(value = "/beertypes", method = RequestMethod.GET)
	public @ResponseBody String passTypes() {

		String ret = dao.getBeerTypes().toString();
		return ret;

	}
//	@CrossOrigin(origins = "*")
	@RequestMapping(value = "/brands", method = RequestMethod.GET)
	public @ResponseBody String passBrands() {

		String ret = dao.getBrands().toString();
		return ret;

	}
//	@CrossOrigin(origins = "*")
	@RequestMapping(value = "/findrestaurants", method = RequestMethod.POST)
	public @ResponseBody String findRestaurants(@RequestParam JSONObject params) {

//		JSONParser parser = new JSONParser();
		return dao.findRestaurants(params).toString();
	}

}