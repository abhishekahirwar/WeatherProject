const http = require('http');
const fs = require('fs');
require('dotenv').config();
const PORT = process.env.PORT || 4000;

const homeFile = fs.readFileSync('home.html', 'utf-8');
const replaceVal = (tempVal, orgVal) => {
    if (!orgVal || !orgVal.main || !orgVal.main.temp || !orgVal.main.temp_min || !orgVal.main.temp_max || !orgVal.name || !orgVal.sys || !orgVal.sys.country || !orgVal.weather || !orgVal.weather[0] || !orgVal.weather[0].main) {
        return tempVal;
    }

    // Replace placeholders with actual data
    let temperature = tempVal.replace('{%tempval%}', Math.round(orgVal.main.temp - 273.15));
    temperature = temperature.replace('{%tempmin%}', Math.round(orgVal.main.temp_min - 273.15));
    temperature = temperature.replace('{%tempmax%}', Math.round(orgVal.main.temp_max - 273.15));
    temperature = temperature.replace('{%location%}', orgVal.name);
    temperature = temperature.replace('{%country%}', orgVal.sys.country);
    temperature = temperature.replace('{%tempstatus%}', orgVal.weather[0].main);
    return temperature;
};

const server = http.createServer(async (req, res) => {
    if (req.url === '/') {
        try {
            const url = await fetch("https://api.openweathermap.org/data/2.5/weather?q=bhopal&appid=" + process.env.API_KEY);
            const data = await url.json();
            const realTimeData = replaceVal(homeFile, data);
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(realTimeData);
            res.end();
        } catch (err) {
            console.error("Error fetching weather data:", err);
            res.writeHead(500, { 'Content-Type': 'text/html' });
            res.end('Internal Server Error');
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('File not found');
    }
});

server.listen(PORT, () => {
    console.log(`Server is started at PORT ${PORT}`);
});