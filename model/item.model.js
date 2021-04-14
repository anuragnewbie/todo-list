const mongoose = require("mongoose");

// creating Item Schema
const itemSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true
	}
});

// creating model based of Item schema
const Item = mongoose.model("Item", itemSchema);

module.exports = Item;
