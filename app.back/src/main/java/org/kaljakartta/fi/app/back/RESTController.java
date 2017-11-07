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

    @RequestMapping(value = "/restaurants", method = RequestMethod.GET)
    public @ResponseBody String passRestaurants(@RequestParam String name) {

//    	return "JEE LÖYTY!";
    	String ret = Dao.getRestaurant(name);
    	return ret;

    }

    @RequestMapping(value = "/beertypes", method = RequestMethod.GET)
    public @ResponseBody String passRestaurants() {

//    	return "JEE LÖYTY!";
    	String ret = Dao.getBeerTypes().toString();
    	return ret;

    }

    @RequestMapping(value = "/findrestaurants", method = RequestMethod.GET)
    public @ResponseBody String findRestaurants(@RequestParam JSONObject keys) {


    	String ret = Dao.filterRestaurants(keys).toString();
    	return ret;
    }


}