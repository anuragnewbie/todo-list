const mongoose = require("mongoose");
const itemList = require(__dirname + "/item.model.js");

// creating List schema
const listSchema = {
	name: {
		type: String,
		required: true,
		trim: true
	},
	itemsCollection: [itemList.schema]
};

// creating model based of List schema
const List = mongoose.model("List", listSchema);

module.exports = List;
