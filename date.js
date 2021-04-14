// my module to generate current date

module.exports = function () {
	// creating a new date object
	const today = new Date();

	// setting the format of the date that is being displayed
	const options = {weekday:"long", day:"numeric", month:"long"};

	// toLocaleDateString method returns string representation of the portion of the date
	return today.toLocaleDateString("en-US", options);
}