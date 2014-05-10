// Create a global object
var KH13 = {}
window.KH13 = KH13;

// Define constants
KH13.homepageURL  = "http://kh13.com";
KH13.newsfeedURL  = "http://kh13.com/wordpress/feed/atom/";
KH13.newsInterval = 10 * 60 * 1000; // 10 minutes
KH13.dateCutoff   = new Date("01 Apr 2014");

// Handle clicks to the browser action button
/*chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.tabs.create({
        url: KH13.homepageURL
    });
});*/

// Adapted from http://stackoverflow.com/a/9609450
var decodeEntities = (function() {
	var element = document.createElement('div');
	function decodeHTMLEntities(str) {
		if (str && typeof str === 'string') {
			str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
			str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
			element.innerHTML = str;
			str = element.textContent;
			element.textContent = '';
		}
		return str;
	}
	return decodeHTMLEntities;
})();

// Load the Google Feeds API
google.load("feeds", "1");

// Load the list of posts we've seen  
KH13.seen = localStorage["seen"];
if (!KH13.seen) {
	KH13.seen = [];
}
else {
	KH13.seen = JSON.parse(KH13.seen);
}

// Add a post to the list of posts we've seen
function addSeen(id) {
	KH13.seen.push(id);
	localStorage["seen"] = JSON.stringify(KH13.seen);
}

// Load a feed and check it for new posts
function loadFeed() {
	KH13.feed.load(onFeedLoad);
	setTimeout(loadFeed, KH13.newsInterval);
}

//Check a feed for new posts (feed onLoad callback)
function onFeedLoad(result){
	console.log("Checking feed...");
	if(!result.error){
		var container = document.getElementById("feed");
		for (var i = 0; i < result.feed.entries.length; i++) {
			var entry = result.feed.entries[i];
			entry.date = new Date(entry.publishedDate);
			if(KH13.seen.indexOf(entry.link) < 0 && entry.date > KH13.dateCutoff){
				sendNotification(entry);
				addSeen(entry.link);
			}
		}
	}
	else{
		console.error("There was an error loading the feed.")
	}
}

//Send a notification about a new post (feed entry)
function sendNotification(entry){
	var opt = {
		type: "basic",
		title: decodeEntities(entry.title),
		message: decodeEntities(entry.content),
		iconUrl: "images/icon-128.png",
		isClickable: true
	};
	chrome.notifications.create(entry.link, opt, function(){});
}

chrome.notifications.onClicked.addListener(function(notificationId){
	chrome.tabs.create({
		url: notificationId.replace("wordpress/archives", "news") // Change http://kh13.com/wordpress/archives/46078 into http://kh13.com/news/46078
	});
	chrome.notifications.clear(notificationId, function(){});
});

// Once the Google Feeds API loads, check the feed
google.setOnLoadCallback(start);
function start(){
    KH13.feed = new google.feeds.Feed(KH13.newsfeedURL);
	loadFeed();
	console.log("Started checking feeds...");
}
