const express = require('express');
const path = require('path');
const http = require('http');
const app = express();
const port = process.env.FILE_UPLOAD_TEST_SERVER_PORT;

app.use(express.static(path.resolve(__dirname, 'dist')));

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

http.createServer(app).listen(port, () => {
	console.log(`Front Server is running on port ${port}`);
});
