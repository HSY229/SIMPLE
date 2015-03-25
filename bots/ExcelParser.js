/*
var ExcelParser = require('./bots/ExcelParser.js');
var ecFile = require('ecfile');
var fs = require('fs');

var excel = fs.readFileSync('xls1.xlsx');
var ecfile = new ecFile(excel);
var parser = new ExcelParser();
parser.exec(ecfile.toJSON());

*/

var ParentBot = require('./_SocketBot.js')
,	fs = require('fs')
,	util = require('util')
,	xlsx = require('node-xlsx')
,	ecFile = require('ecfile')
,	Result = require('../classes/Result.js');

var Bot = function (config) {
	if (!config) config = {};
	this.init(config);
	this.path = [
		{"method": "post", "path": "/excelparser/"}
	];
};

util.inherits(Bot, ParentBot);

Bot.prototype.init = function (config) {
	Bot.super_.prototype.init.call(this, config);

};

Bot.prototype.exec = function (msg) {
	if(msg.blob) { msg = {"body": msg}; }

	var result = new Result();
	var datalist = [];

	for(var key in msg.files) {
		var file = fs.readFileSync(msg.files[key]["path"]);
		var ecfile = new ecFile(file);
		var data = xlsx.parse(ecfile.toBlob());

		for(var k in data) {
			var table = this.parseTable(data[k].data, data[k].name);

			var rs = {
				"label": table.label,
				"path": "/dataset/" + table.name + "/"
			};

			datalist.push(rs);
		}
	}

	result.setResult(1);
	result.setData(datalist);

	return result.toJSON();
};

Bot.prototype.parseTable = function(dataset, label) {
	var msg = {
		"method": "post",
		"body": dataset,
		"query": {}
	}

	if(typeof(label) == 'string') { msg.query.label = label; }

	var rs = this.ask(msg, "Dataset");

	return rs.data;
};



module.exports = Bot;