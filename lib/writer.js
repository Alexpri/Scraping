'use strict';

function writer(filePath) {
	const file = fs.createWriteStream(filePath);

	file
		.on('error', function () {
		  	console.log('file has been written');
		})
		.on('finish', function () {
		  	console.log('file has been written');
		});

}

module.exports = writer;