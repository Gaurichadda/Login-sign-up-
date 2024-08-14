const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the current directory
app.use(express.static(__dirname));

// Serve the registration form
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve the home page after login
app.get('/home.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});

// Serve the login form
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login33.html'));
});

// Handle logout
app.get('/logout', (req, res) => {
    // Here you can clear the session or any authentication data
    // For example, if you are using sessions:
    // req.session.destroy();

    // Redirect to the login page after logging out
    res.redirect('/login33.html');
});

// Serve the employee details page
app.get('/employee.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'employee.html'));
});

// Serve the salary submission form
app.get('/employeesalary.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'employee-salary.html'));
});

// Handle login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    fs.readFile('data.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Error reading data file.' });
        }

        const users = JSON.parse(data);
        const user = users.find(u => u.email === username && u.password === password);

        if (user) {
            res.json({ message: 'Login successful', redirect: '/home.html' });
        } else {
            res.status(401).json({ message: 'Invalid username or password.' });
        }
    });
});

// Handle registration
app.post('/register', (req, res) => {
    const { name, email, password } = req.body;

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long and include numbers, alphabets, and special characters.' });
    }

    fs.readFile('data.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Error reading data file.' });
        }

        const users = JSON.parse(data);
        users.push({ name, email, password });

        fs.writeFile('data.json', JSON.stringify(users, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error writing data file.' });
            }

            res.json({ message: 'Registration successful', redirect: '/login33.html' });
        });
    });
});

// Handle viewing employee details
app.get('/showemployeedetails', (req, res) => {
    fs.readFile('employeeDetails.txt', 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') {
            return res.status(500).json({ message: 'Error reading data file.' });
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

        res.write('</table><br><br><a href="/employee.html">Back to Main Form</a></body></html>');
        res.end();
    });
});

// Handle form submission for new employee
app.post('/submit', (req, res) => {
    const { name, email, pswd, Position, Salary } = req.body;
    const newData = `${name},${email},${pswd},${Position},${Salary}\n`;

    fs.readFile('employeeDetails.txt', 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') {
            return res.status(500).json({ message: 'Error reading data file.' });
        }

        let jsonData = [];

        if (!err && data) {
            jsonData = data.trim().split('\n');
        }

        jsonData.push(newData.trim());

        fs.writeFile('employeeDetails.txt', jsonData.join('\n'), 'utf8', (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error writing data file.' });
            }

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write('<html><body><h1>Data Saved Successfully</h1>');
            res.write('<a href="/employee.html">Back to Main Form</a>');
            res.write('</body></html>');
            res.end();
        });
    });
});

// Handle update form
app.get('/update', (req, res) => {
    const id = querystring.parse(req.url.split('?')[1]).id;

    fs.readFile('employeeDetails.txt', 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') {
            return res.status(500).json({ message: 'Error reading data file.' });
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
});

// Handle update submission
app.post('/submit-update', (req, res) => {
    const id = querystring.parse(req.url.split('?')[1]).id;
    const { name, email, pswd, Position, Salary } = req.body;
    const updatedData = `${name},${email},${pswd},${Position},${Salary}\n`;

    fs.readFile('employeeDetails.txt', 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') {
            return res.status(500).json({ message: 'Error reading data file.' });
        }

        let jsonData = [];

        if (!err && data) {
            jsonData = data.trim().split('\n');
        }

        jsonData[Number(id)] = updatedData.trim();

        fs.writeFile('employeeDetails.txt', jsonData.join('\n'), 'utf8', (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error writing data file.' });
            }

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write('<html><body><h1>Data Updated Successfully</h1>');
            res.write('<a href="/employee.html">Back to Main Form</a>');
            res.write('</body></html>');
            res.end();
        });
    });
});

// Handle deletion
app.get('/delete', (req, res) => {
    const id = querystring.parse(req.url.split('?')[1]).id;

    fs.readFile('employeeDetails.txt', 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') {
            return res.status(500).json({ message: 'Error reading data file.' });
        }

        let jsonData = [];

        if (!err && data) {
            jsonData = data.trim().split('\n');
        }

        jsonData.splice(Number(id), 1);

        fs.writeFile('employeeDetails.txt', jsonData.join('\n'), 'utf8', (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error writing data file.' });
            }

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write('<html><body><h1>Data Deleted Successfully</h1>');
            res.write('<a href="/employee.html">Back to Main Form</a>');
            res.write('</body></html>');
            res.end();
        });
    });
});

// Listen on port 3000
app.listen(3000, () => {
    console.log('Server running on port 3000');
});

app.post('/submitSalary', (req, res) => {
    const { employeeID, salary } = req.body;

    fs.readFile('employeeSalary.txt', 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') {
            return res.status(500).json({ message: 'Error reading data file.' });
        }

        let salaryData = [];

        if (!err && data) {
            salaryData = data.trim().split('\n');
        }

        salaryData.push(`${employeeID},${salary}`);

        fs.writeFile('employeeSalary.txt', salaryData.join('\n'), 'utf8', (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error writing data file.' });
            }

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write('<html><body><h1>Salary Data Saved Successfully</h1>');
            res.write('<a href="/employee-salary.html">Back to Salary Form</a>');
            res.write('</body></html>');
            res.end();
        });
    });
});
