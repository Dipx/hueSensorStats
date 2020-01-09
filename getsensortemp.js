let hue = require("node-hue-api");
let HueApi = require("node-hue-api").HueApi;
let fs = require("fs");
const MongoClient = require('mongodb').MongoClient;

let bridgefilePath = 'bridgeIp.json';
let statefilePath = 'hueState.json';
let temperatureSensorsName = ['temperatureTerrasse','temperatureCuisine','temperatureSalon', 'temperatureHall'];
let lightLevelSensorsName = ['lightLevelTerrasse','lightLevelCuisine','lightLevelSalon', 'lightLevelHall'];
let optionsDate = {  day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'};

var startScraping = () => {
    fs.readFile(bridgefilePath, 'utf8', (err, data) => {
        if(err) throw err;
        data = JSON.parse(data);
        hue.nupnpSearch().done((result) => bridgesToJson(result, data));
    });
}



var bridgesToJson = (bridges, data) => {
    if(bridges.length > 0) {
        for(let i = 0; bridges.length > i; i++) {
            if(data.bridges.length !== 0) {
                
                if(!data.bridges.some(bridge => bridge.id === bridges[i].id)) {
                    fs.writeFile(bridgefilePath, addBridgeToJson(bridges[i], data), (err) => console.log(err));
                    console.log(data);
                } else {
                    connectToBridge(data);
                }
            } else {
                fs.writeFile(bridgefilePath, addBridgeToJson(bridges[i], data), (err) => console.log(err));
                connectToBridge(data);
            }
                   
        }
    }
    
    
};

var addBridgeToJson = (bridge, data) => {
    let bridgeObject = {
        id: bridge.id,
        ipAddress: bridge.ipaddress,
        name: bridge.name
    };
    data.bridges.push(bridgeObject);
    return JSON.stringify(data);
}

var connectToBridge = (data) => {
    let api = new HueApi(data.bridges[0].ipAddress, "FdZbJxNzxTVZ0kZ8pjpSsKsG-I9M-isYW1mq4wsM");

    api.getFullState().then(result => writeStateToFile(result)).done();
}

var writeStateToFile = (result) => {
    let sensors = formatRawSensorsData(result.sensors);
    fs.open(statefilePath, 'a', 666, function( e, id) {
        fs.write(id, sensors + ',\r\n', null, 'utf8', function() {
            fs.close(id, () => console.log("updated file on " + new Date(Date.now()).toLocaleDateString('fr-BE', optionsDate)));
        })
    });
}

var formatRawSensorsData = sensors => {
    var temperatureSensors = {};
    var lightLevelSensors = {};
    var dateNow = new Date(Date.now()).toLocaleDateString('fr-BE', optionsDate);
    for (var key in sensors) {
        if(temperatureSensorsName.includes(sensors[key].name)) {
            sensor = sensors[key];
            var temp = {
                
                state: {
                    temperature: sensor.state.temperature,
                    lastUpdated: sensor.state.lastupdated,
                    battery: sensor.config.battery,
                    on: sensor.config.on
                }
            };
            temperatureSensors[sensor.name] = temp;
            temperatureSensors.date = dateNow;
        }
        if(lightLevelSensorsName.includes(sensors[key].name)) {
            sensor = sensors[key];
            var temp = {
                
                state: {
                    lightlevel: sensor.state.lightlevel,
                    lastUpdated: sensor.state.lastupdated,
                    battery: sensor.config.battery,
                    on: sensor.config.on
                }
            };
            lightLevelSensors[sensor.name] = temp;
            lightLevelSensors.date = dateNow;
        }
    };
    console.log(temperatureSensors);
    console.log(lightLevelSensors);
    //postTempData(temperatureSensors);
    //postLightLevelData(lightLevelSensors);
    return JSON.stringify([temperatureSensors, lightLevelSensors], null, "\t");
}

var postTempData = data => {
    const uri = "mongodb+srv://SensorApp:m6YmDnBlVkQTo6d7@sensorsdata-09tps.azure.mongodb.net/test?retryWrites=true&w=majority";
    const client = new MongoClient(uri, { useNewUrlParser: true });
    client.connect(err => {
      const collection = client.db("SensorsMetrics").collection("Metrics");
      collection.insertOne(data);
      client.close();
    });
    
}

var postLightLevelData = data => {
    const uri = "mongodb+srv://SensorApp:m6YmDnBlVkQTo6d7@sensorsdata-09tps.azure.mongodb.net/test?retryWrites=true&w=majority";
    const client = new MongoClient(uri, { useNewUrlParser: true });
    client.connect(err => {
      const collection = client.db("SensorsMetrics").collection("lightLevelMetrics");
      collection.insertOne(data);
      client.close();
    });
    
}

module.exports = {
    startScraping: startScraping
}