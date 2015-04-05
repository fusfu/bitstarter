#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "https://powerful-citadel-3697.herokuapp.com/";
var sys = require('util');
var rest = require('restler');
var assertUrlExists = function (val) {return val.toString();};

var callThis = function(result) {
    if (data instanceof Error) {
	console.log("callThis timeout")
        sys.puts('Error: ' + result.message);
        this.retry(5000); // try again after 5 sec
    } else {
        sys.puts(result);
    }
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>','index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <url_path>', 'url to check', clone(assertUrlExists), URL_DEFAULT)
        .parse(process.argv);
    if (program.url) {
	console.log("~~~~~~~~~~~~~~~ DEBUG URL");
	console.log(program.url);
	console.log("~~~~~~~~~~~~~~~ END DEBUG");
        rest.get(program.url).on('complete', function(result) {
            fs.writeFileSync("myurl.html", result);   // Added this line
            var checkJson = checkHtmlFile("myurl.html", program.checks);
            var outJson = JSON.stringify(checkJson, null, 4);
            console.log(outJson);
        });

    } else if (program.file) {
	console.log("~~~~~~~~~~~~~~~ DEBUG FILE");
        var checkJson = checkHtmlFile(program.file, program.checks);
        var outJson = JSON.stringify(checkJson, null, 4);
        console.log(outJson);
    } else {
	exports.checkHtmlFile = checkHtmlFile;
    }
}

