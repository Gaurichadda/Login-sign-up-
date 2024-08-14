const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

const PORT = 3000;

const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
        // Serve the form HTML
        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.createReadStream(path.join(__dirname, 'index.html')).pipe(res);
    } else if (req.method === 'GET' && req.url === '/data') {
        // Serve the data as a table
        fs.readFile('employeeDetails.txt', 'utf8', (err, data) => {
            if (err && err.code !== 'ENOENT') {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                return res.end('Error reading data file');
            }

            let jsonData = [];

            if (!err && data) {
                jsonData = data.trim().split('\n').map(line => {
                    const [name, email, pswd, Position, Salary] = line.split(',');
                    return { name, email, pswd, Position, Salary };
                });
            }

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write('<html><body><h1>Stored Data</h1><table border="1"><tr><th>Name</th><th>Email</th><th>Password</th><th>Position</th><th>Salary</th><th>Update</th><th>Delete</th></tr>');

            jsonData.forEach((item, index) => {
                res.write(`<tr><td>${item.name}</td><td>${item.email}</td><td>${item.pswd}</td><td>${item.Position}</td><td>${item.Salary}</td>
                    <td><a href="/update?id=${index}">Update</a></td>
                    <td><a href="/delete?id=${index}">Delete</a></td></tr>`);
            });

            res.write('</table><br><br><a href="/">Back to Main Form</a></body></html>');
            res.end();
        });
    } else if (req.method === 'POST' && req.url.startsWith('/submit')) {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const formData = querystring.parse(body);
            const newData = `${formData.name},${formData.email},${formData.pswd},${formData.Position},${formData.Salary}\n`;

            fs.readFile('employeeDetails.txt', 'utf8', (err, data) => {
                if (err && err.code !== 'ENOENT') {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    return res.end('Error reading data file');
                }

                let jsonData = [];

                if (!err && data) {
                    jsonData = data.trim().split('\n');
                }

                if (req.url === '/submit') {
                    // Add new form data to the array
                    jsonData.push(newData.trim());
                } else if (req.url.startsWith('/submit-update')) {
                    const id = querystring.parse(req.url.split('?')[1]).id;
                    jsonData[Number(id)] = newData.trim();
                }

                fs.writeFile('employeeDetails.txt', jsonData.join('\n'), 'utf8', (err) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        return res.end('Error writing data file');
                    }

                    // Show success message and option to go back to main form
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write('<html><body><h1>Data Saved Successfully</h1>');
                    res.write('<a href="/">Back to Main Form</a>');
                    res.write('</body></html>');
                    res.end();
                });
            });
        });
    } else if (req.method === 'GET' && req.url.startsWith('/update')) {
        const id = querystring.parse(req.url.split('?')[1]).id;

        fs.readFile('employeeDetails.txt', 'utf8', (err, data) => {
            if (err && err.code !== 'ENOENT') {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                return res.end('Error reading data file');
            }

            let jsonData = [];

            if (!err && data) {
                jsonData = data.trim().split('\n').map(line => {
                    const [name, email, pswd, Position, Salary] = line.split(',');
                    return { name, email, pswd, Position, Salary };
                });
            }

            const item = jsonData[Number(id)];

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write('<html><body><h1>Update Form</h1>');
            res.write('<form action="/submit-update?id=' + id + '" method="POST">');
            res.write('<label for="name">Name:</label>');
            res.write('<input type="text" id="name" name="name" value="' + item.name + '" required>');
            res.write('<br><br>');
            res.write('<label for="email">Email:</label>');
            res.write('<input type="email" id="email" name="email" value="' + item.email + '" required>');
            res.write('<br><br>');
            res.write('<label for="pswd">Password:</label>');
            res.write('<input type="password" id="pswd" name="pswd" value="' + item.pswd + '" required>');
            res.write('<br><br>');
            res.write('<label for="Position">Position:</label>');
            res.write('<input type="text" id="Position" name="Position" value="' + item.Position + '" required>');
            res.write('<br><br>');
            res.write('<label for="Salary">Salary:</label>');
            res.write('<input type="number" id="Salary" name="Salary" value="' + item.Salary + '" required>');
            res.write('<br><br>');
            res.write('<button type="submit">Update</button>');
            res.write('</form></body></html>');
            res.end();
        });
    } else if (req.method === 'GET' && req.url.startsWith('/delete')) {
        const id = querystring.parse(req.url.split('?')[1]).id;

        fs.readFile('employeeDetails.txt', 'utf8', (err, data) => {
            if (err && err.code !== 'ENOENT') {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                return res.end('Error reading data file');
            }

            let jsonData = [];

            if (!err && data) {
                jsonData = data.trim().split('\n');
            }

            jsonData.splice(Number(id), 1);

            fs.writeFile('employeeDetails.txt', jsonData.join('\n'), 'utf8', (err) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    return res.end('Error writing data file');
                }

                // Show success message and option to go back to main form
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write('<html><body><h1>Data Deleted Successfully</h1>');
                res.write('<a href="/">Back to Main Form</a>');
                res.write('</body></html>');
                res.end();
            });
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
