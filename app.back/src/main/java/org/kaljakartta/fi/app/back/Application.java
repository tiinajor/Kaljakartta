package org.kaljakartta.fi.app.back;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;


@SpringBootApplication
public class Application {

    public static void main(String[] args) {
    	System.getProperties().put( "server.port", 130 );
        SpringApplication.run(Application.class, args);
    }
}
