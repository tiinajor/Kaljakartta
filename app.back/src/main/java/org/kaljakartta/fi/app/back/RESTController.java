package org.kaljakartta.fi.app.back;

import org.springframework.web.bind.annotation.RestController;
import org.json.JSONObject;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@RestController
public class RESTController
{

    @RequestMapping(value = "/restaurant", method = RequestMethod.GET)
    public @ResponseBody String passRestaurants(@RequestParam String name) {

//    	String ret = Dao.getRestaurant(name);

			return Dao.getRestaurant(name).toString();


    }

    @RequestMapping(value = "/beertypes", method = RequestMethod.GET)
    public @ResponseBody String passTypes() {

    	String ret = Dao.getBeerTypes().toString();
    	return ret;

    }

    @RequestMapping(value = "/brands", method = RequestMethod.GET)
    public @ResponseBody String passBrands() {

    	String ret = Dao.getBrands().toString();
    	return ret;

    }

    @RequestMapping(value = "/findrestaurants", method = RequestMethod.GET)
    public @ResponseBody String findRestaurants(@RequestParam JSONObject keys) {


    	String ret = Dao.filterRestaurants(keys).toString();
    	return ret;
    }


}