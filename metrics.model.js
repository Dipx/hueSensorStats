import { Schema } from "mongoose";

const metricSchema = new Schema({
    [key]: {
		"temperatureSalon": {
			"state": {
				"temperature": Number,
				"battery": Number,
				"on": Boolean
			}
		},
		"temperatureCuisine": {
			"state": {
				"temperature": Number,
				"battery": Number,
				"on": Boolean
			}
		},
		"temperatureTerrasse": {
			"state": {
				"temperature": Number,
				"battery": Number,
				"on": Boolean
			}
		}
	}
})