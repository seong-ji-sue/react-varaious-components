const express = require('express');
const path = require('path');
const http = require('http');
const app = express();
const port = 6002;

app.use(express.static(path.resolve(__dirname, 'dist')));

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

http.createServer(app).listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
