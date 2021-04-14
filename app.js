const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");
const {check, validationResult} = require("express-validator");

// importing my created modules
const date = require(__dirname + "/date.js");
const itemList = require(__dirname + "/model/item.model.js");
const listList = require(__dirname + "/model/list.model.js");

const app = express();

// tells our app (generated using express module) to use as view engine
app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));

// we are telling express to serve this public folder as static resource
app.use(express.static("public"));

// connected to mongoDB database server and created a new database
mongoose.connect("mongodb+srv://mongodb_cluster_username:mongodb_cluster_password@cluster0.oyb7q.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});

// calling the date() function of date module
const day = date();

const defaultItem1 = new itemList({
	name: "Hit checkbox to delete item"
});

// array of item objects 
const defaultItems = [defaultItem1];

// client's GET request to home route
app.get("/", function(req, res)
{
	itemList.estimatedDocumentCount(function (error, count) {
		if (error) {
			console.log(error);
		} else {
			// Item collection empty
			if(count === 0){
				itemList.insertMany(defaultItems, function(error) {
					if (error) {
						console.log(error);
					} else {
						console.log("Item inserted");
					}
				});
			}
		}
	});

	// performing READ operation in Item collection
	itemList.find(function (error, result) {
		if (error) {
			console.log(error);
		} else {
			res.render('list', {typeOfList : day, newListItems : result});
		}
	});
});

// client's GET request to home/dynamic route
app.get("/:routeName", function(req, res) {	 
	const listName = _.capitalize(req.params.routeName);

	listList.findOne({name: listName}, function (error, found) {
		if (error) {
			console.log(error);
		} else {
			if(!found) {
				// create new Item document
				const list = new listList({
					name: listName,
					itemsCollection: defaultItems
				});

		    	list.save();
				res.redirect("/" + listName);
			} else {
				// display items
				res.render("list", {typeOfList: found.name, newListItems: found.itemsCollection});
			}
		}
	});
});

// client's POST request to home route
app.post("/", [ check('newItem', 'Item name must be of 4 characters minimum.').isLength({min: 4}), check('newItem', "invalid name").matches(/^[A-Za-z]/) ], (req, res) => {	
	const errors = validationResult(req);

	if(!errors.isEmpty()){
		res.json(errors);
	}else{
		// collecting the item user entered & the list name
		const itemName = req.body.newItem;
		const routeName = req.body.list;

		// creating new document in Item collection
		const item = new itemList({
			name: itemName
		});

		// list from which user has made a POST request match with home route
		if(routeName === day){
			item.save();
			res.redirect("/");
		}else{
			// list from which user has made a POST request match with any of custom list route
			listList.findOne({name: routeName}, function (error, result) {
				if(error){
					console.log(error);
				}else{
					result.itemsCollection.push(item);
					result.save();
					res.redirect("/" + routeName);
				}
			});
		}
	}
});

// client's POST request to delete route
app.post("/delete", function (req, res) {
	const checkedItemId = req.body.checkitem;
	const typeOfListRoute = req.body.listType;

	if(typeOfListRoute === day){
		// performing DELETE operation on Item collection
		itemList.findByIdAndRemove(checkedItemId, function(error){
			if(error){
				console.log(error);
			}else{
				console.log("Successfully deleted checked item");
				res.redirect("/");
			}
		});
	}else{
		// performing DELETE operation on List collection
		listList.findOne({name: typeOfListRoute}, function(error, result) {
			if(error){
				console.log(error);
			}else{	
				result.itemsCollection.remove(checkedItemId);
				result.save();
				res.redirect("/" + typeOfListRoute);
			}
		});
	}
});

// starting server
app.listen(process.env.PORT || 3000, function () {
	console.log("Server is listening on port 3000...");
});
