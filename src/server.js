const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
	let filePath = '.' + req.url;
	if (filePath === './') {
		filePath = './index.html';
	}

	const extname = String(path.extname(filePath)).toLowerCase();
	let contentType = 'text/html';

	const mimeTypes = {
		'.html': 'text/html',
		'.css': 'text/css',
		'.js': 'text/javascript',
	};

	contentType = mimeTypes[extname] || 'application/octet-stream';

	fs.readFile(filePath, (err, content) => {
		if (err) {
			if (err.code === 'ENOENT') {
				res.writeHead(404);
				res.end('404 Not Found');
			} else {
				res.writeHead(500);
				res.end('500 Internal Server Error: ' + err.code);
			}
		} else {
			res.writeHead(200, { 'Content-Type': contentType });
			res.end(content, 'utf-8');
		}
	});
});

const port = process.env.PORT || 3000;

server.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
