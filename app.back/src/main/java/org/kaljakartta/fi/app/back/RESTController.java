package org.kaljakartta.fi.app.back;

import org.springframework.web.bind.annotation.RestController;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;


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

	@RequestMapping(value = "/findrestaurants", method = RequestMethod.POST, consumes={MediaType.APPLICATION_JSON_VALUE})
	public @ResponseBody String findRestaurants(@RequestParam String keys) {

		JSONParser parser = new JSONParser();
		try {
			return dao.findRestaurants((JSONObject) parser.parse(keys)).toString();
		} catch (ParseException e) {
			e.printStackTrace();
			return HttpStatus.I_AM_A_TEAPOT.toString();
		}
	}

}