# BluJayWay
Node App For tracking drones (or any gps device) on Google Maps.
Uses Adafruit ultimate GPS device (https://www.adafruit.com/product/746)
The gps client code in this project was run on a raspberry pi-0, but it could be run on any linux box.

## Installing & Running
#### Create the secrets file that contains google maps api key
Create the file 'secrets.js' in the 'server' directory of this project and add these contents:
``` javascript
module.exports.getGoogleMapsApiKey = function(){
	return "Your-api-key-here";
}
 ```
#### NPM install
```
cd BluJayWay/
npm install
```
#### Run App
```
npm start
```

## Demos
![droneMapImage](https://raw.githubusercontent.com/bclouser/BluJayWay/master/docs/droneOnMap1.png)
![gEarthImage1](https://raw.githubusercontent.com/bclouser/BluJayWay/master/docs/googleEarth1.png)
![gEarthImage2](https://raw.githubusercontent.com/bclouser/BluJayWay/master/docs/googleEarth2.png)
[Technical Guide](docs/Project BluJay - Technical Reference Guide v1)
