let cron = require("node-cron");
let sensorScrapper = require("./getsensortemp");

cron.schedule("*/59 * * * *", () => {
    sensorScrapper.startScraping();
});

function publish() {
   
    pubnub = new PubNub({
        publishKey : 'pub-c-44aff46c-d75b-41d3-b28e-28ff9cf6f82f',
        subscribeKey : 'sub-c-f16d187a-9a74-11e9-9ac8-0ed882abeb26'
    })
       
    function publishSampleMessage() {
        console.log("Since we're publishing on subscribe connectEvent, we're sure we'll receive the following publish.");
        var publishConfig = {
            channel : "hello_world",
            message : {
                title: "greeting",
                description: "hello world!"
            }
        }
        pubnub.publish(publishConfig, function(status, response) {
            console.log(status, response);
        })
    }
       
    pubnub.addListener({
        status: function(statusEvent) {
            if (statusEvent.category === "PNConnectedCategory") {
                publishSampleMessage();
            }
        },
        message: function(msg) {
            console.log(msg.message.title);
            console.log(msg.message.description);
        },
        presence: function(presenceEvent) {
            // handle presence
        }
    })      
    console.log("Subscribing..");
    pubnub.subscribe({
        channels: ['hello_world'] 
    });
};