var serverRoot = "./";
var pathsToCheck = ["./lib"];
var filesToCheck = [];
var port = 8080;
var fs = require("fs");
var index = fs.readFileSync("index.html", "utf8");
var url = require("url");

/*
* Http Server 8080 serving index.html
*/

var http = require("http");
var server = http.createServer(function (req, res) {
    
    var path = url.parse(req.url);
    console.log("GET "+serverRoot + path.path);
    fs.readFile(serverRoot + path.path.substr(1), "utf8", function (err, data) {
	if (err) {
	    res.writeHead(404, { 
		"Content-Type": "text/html"
	    });
	    res.end("Error delivering file");
	} else {
    	    res.writeHead(200, { 
		"Content-Type": "text/html"
	    });
	    res.end(data.toString());
	}
    });
    
    
});
server.listen(port, function () {
    console.log("starting server on port "+port);
}).on("exit", function () {
    console.log("stopping server");
});

function onChange (event, file) {
    if (event === "change") {
	console.log(file+ " changed");
    } else if (event == "rename") {
    	console.log(file+ " renamed");
    }
}
function installWatcherOnFile(dir, file) {
    console.log(dir+"/"+file);
    fs.watch(dir+"/"+file, onChange);
}

function installWatcherOnDir(dir, err, files) {
    if (err) throw err;
    files.forEach(installWatcherOnFile.bind(null, dir));
}

function installEachDir(dir) {
    fs.readdir(dir, installWatcherOnDir.bind(null, dir));
}


pathsToCheck.forEach(installEachDir);
//filesToCheck.forEach(installWatcherOnFile);

