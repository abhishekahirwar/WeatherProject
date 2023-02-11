const http = require('http');
const fs = require('fs');
const requests = require('requests');
const hostname = '127.0.0.1';
const port = process.env.PORT || 8000;

const homeFile = fs.readFileSync('home.html', 'utf-8');
const replaceVal = (tempVal, orgVal) => {
    let temperature = tempVal.replace('{%tempval%}', Math.round(orgVal.main.temp - 273.15));
    temperature = temperature.replace('{%tempmin%}', Math.round(orgVal.main.temp_min - 273.15));
    temperature = temperature.replace('{%tempmax%}', Math.round(orgVal.main.temp_max - 273.15));
    temperature = temperature.replace('{%location%}', orgVal.name);
    temperature = temperature.replace('{%country%}', orgVal.sys.country);
    temperature = temperature.replace('{%tempstatus%}', orgVal.weather[0].main);
    return temperature;
}

const server = http.createServer((req, res) => {
    if (req.url == '/') {
        requests("https://api.openweathermap.org/data/2.5/weather?q=bhopal&appid=d1c423674d7da0ca62d119e3d72b979c")
            .on('data', (chunk) => {
                const objdata = JSON.parse(chunk);
                const arrData = [objdata];
                // console.log(arrData);
                const realTimeData = arrData.map((val) => replaceVal(homeFile, val)).join('');
                res.write(realTimeData);
            })
            .on('end', (err) => {
                if (err) return console.log('connection closed due to errors', err)
                res.end();
            });
    }
    else {
        res.end('file not found');
    }
});

server.listen(port, hostname, () => {
    console.log("Server is started")
});