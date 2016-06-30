'use strict';
const fs         = require('fs');

function writer(filePath, result) {
	const writeStream = fs.createWriteStream(filePath);
	
	result
		.on('error', err => {
		  	console.log('Error', err);
		})
		.on('data', data => {
			writeStream.write(data);
		  	console.log('file has been written Finish');
		})
		.on('end', () => {
		  	console.log('file has been written End');
		});

}

module.exports = writer;