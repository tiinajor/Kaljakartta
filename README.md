# Projektin kuvaus: #

	Kaljakartan avulla käyttäjä voi etsiä oluita ja baareja sekä rajata niitä hakukriteerien (alkoholipitoisuus, hinta, hana/pullo, tilavuus ja baarin etäisyys) mukaan.

# Toteutetut toiminnallisuudet #

### Backend 
	* Tietokantakyselyt
	* Tietokantayhteys

### Frontend
	* Karttapalvelu sekä ravintola- ja osoitehaku Googlen APIsta
	* Menu ja sen toiminnallisuudet
	* Baarin kuvan ja osoitetietojen haku automaattisesti 
	* Responsiivisuus fronttiin
	* Automaattikoonnit


# Projektin vaatimat kirjastot ym: #

	* Spring-Boot
	* Maven
	* OrientDB 2.2
	* TinkerPop 2
	* Gremlin-java 
	* Node.js (npm)
	* Jasmine


# Projektin arkkitehtuuri: #

	Projektin front ja backendien välille muodostetaan REST rajapinta Spring-Boot frameworkin avulla. Tietokantayhteyden ja kyselyt suorittaa Javalla kirjoitettu DAO luokka, joka hyödyntää TinkerPop 2 frameworkkia tulkkaamaan Java sekä Gremlin (TinkerPopin oma kieli) komentoja OrientDB graafitietokannalle. Projektin Backend rakennetaan Mavenin avulla .jar tiedostoksi jota ajetaan (Ubuntu) serverillä systemd servicenä