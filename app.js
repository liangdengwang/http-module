const http = require('http');
const url = require('url');

// Helper function to parse POST data
const getPostData = (req) => {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const contentType = req.headers['content-type'];
                if (contentType === 'application/json') {
                    resolve(JSON.parse(body));
                } else if (contentType === 'application/x-www-form-urlencoded') {
                    const params = new URLSearchParams(body);
                    const data = {};
                    for (const [key, value] of params) {
                        data[key] = value;
                    }
                    resolve(data);
                } else {
                    resolve({});
                }
            } catch (error) {
                reject(error);
            }
        });
    });
};

// Arithmetic operations
const calculate = (num1, num2, operator) => {
    num1 = parseFloat(num1);
    num2 = parseFloat(num2);

    if (isNaN(num1) || isNaN(num2)) {
        throw new Error('Invalid numbers provided');
    }

    switch (operator) {
        case 'add':
            return num1 + num2;
        case 'subtract':
            return num1 - num2;
        case 'multiply':
            return num1 * num2;
        case 'divide':
            if (num2 === 0) {
                throw new Error('Division by zero is not allowed');
            }
            return num1 / num2;
        default:
            throw new Error('Invalid operator');
    }
};

const server = http.createServer(async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS request for CORS
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Parse URL
    const parsedUrl = url.parse(req.url, true);

    try {
        let num1, num2, operator;

        if (req.method === 'GET') {
            // Parse query parameters
            const query = parsedUrl.query;
            num1 = query.num1;
            num2 = query.num2;
            operator = query.operator;
        } else if (req.method === 'POST') {
            // Parse POST data
            const data = await getPostData(req);
            num1 = data.num1;
            num2 = data.num2;
            operator = data.operator;
        }

        if (!num1 || !num2 || !operator) {
            throw new Error('Missing required parameters');
        }

        const result = calculate(num1, num2, operator);

        // Send success response
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'success',
            result: result
        }));

    } catch (error) {
        // Send error response
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'error',
            message: error.message
        }));
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
