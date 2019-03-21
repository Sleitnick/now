/*
	Author:  Stephen Leitnick
	Date:    March 22, 2017
*/


// Milliseconds between time refresh:
const REFRESH_INTERVAL = 250;

// Key used for storing selected time format:
const TIME_FORMAT_KEY = "use_military";

// Debounce milliseconds for clicking on time text:
const DEBOUNCE_TEXT_CLICK = 100;




const USE_STORAGE = ("storage" in chrome);

const DAYS_OF_WEEK = [
	"Sunday", "Monday", "Tuesday", "Wednesday",
	"Thursday", "Friday", "Saturday"
];

const MONTHS = [
	"January", "February", "March", "April", "May",
	"June", "July", "August", "September", "October",
	"November", "December"
];

let lastTextClick = 0;

let timeElement = document.getElementById("time");
let dateElement = document.getElementById("date");
let yearElement = document.getElementById("year");

let useMilitary = false;

let lastMinute = -1;


function pad(num, size) {
	return ("00" + num).substr(-size);
}


// Set the time and date elements:
function setTimeAndDate() {

	let now = new Date();
	let minute = now.getMinutes();

	// If the minute hasn't changed, then we have no reason to refresh the display.
	if (lastMinute === minute) return;

	let hour    = now.getHours();
	let weekDay = DAYS_OF_WEEK[now.getDay()];
	let month   = MONTHS[now.getMonth()];
	let day     = now.getDate();
	let year    = now.getFullYear();

	let suffix  = "";
	let prefix  = "";

	// Formatting based on 24-hour or 12-hour:
	if (useMilitary) {
		hour = pad(hour, 2);
	} else {
		suffix = "<span id='ampm' class='text-dark'>" + (hour < 12 ? "AM" : "PM") + "</span>";
		prefix = "<span id='ampm'>&nbsp;&nbsp;</span>";
		if (hour > 12) hour -= 12;
		if (hour == 0) hour = 12;
		if (hour < 10) prefix += "&nbsp;";
	}

	// Set actual display:
	timeElement.innerHTML = prefix + "" + hour + " " + pad(minute, 2) + "" + suffix;
	dateElement.innerHTML = weekDay + ", " + month + " " + day;
	yearElement.innerHTML = year;

	lastMinute = minute;
}


// Invoked when user clicks on the time element:
function timeElementClicked() {
	let millis = Date.now();
	if ((millis - lastTextClick) < DEBOUNCE_TEXT_CLICK) return;
	lastTextClick = millis;
	useMilitary = !useMilitary;
	lastMinute = -1;
	setTimeAndDate();
	saveTimeFormat();
}


// Save currently-set time format:
function saveTimeFormat() {
	let data = {};
	data[TIME_FORMAT_KEY] = useMilitary;
	if (USE_STORAGE) {
		chrome.storage.sync.set(data);
	}
}


function init() {
	setTimeAndDate();
	setInterval(setTimeAndDate, REFRESH_INTERVAL);
	timeElement.onclick = timeElementClicked;
}


// Load time format & set time display:
if (USE_STORAGE) {
	chrome.storage.sync.get(TIME_FORMAT_KEY, (useM) => {
		useMilitary = (useM ? (useM[TIME_FORMAT_KEY] ? true : false) : false);
		init();
	});
} else {
	init();
}