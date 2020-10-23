const express = require('express')
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const app = express();
const port = 3000;
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(bodyParser.json());

app.get('/', (req, res) => {

    var dataToSend;
    // spawn new child process to call the python script
    const python = spawn('python', ['script1.py']);
    // collect data from script
    python.stdout.on('data', function (data) {
        console.log('Pipe data from python script ...');
        dataToSend = data.toString();
    });
    // in close event we are sure that stream from child process is closed
    python.on('close', (code) => {
        console.log(`child process close all stdio with code ${code}`);
        // send data to browser
        res.send(dataToSend)
    });
})
app.post('/', (req, res) => {
    console.log(req.body);
    var dataToSend = '';
    // spawn new child process to call the python script

    const python = spawn(__dirname + '\\..\\engine\\venv\\Scripts\\python.exe', ['../engine/object_tracking_json.py', '--video', '../frontend/src/assets/1.mp4', '--tracker', 'csrt', '--objects', Buffer.from(JSON.stringify(req.body)).toString('base64')]);
    // const python = spawn('python', ['../engine/script1.py']);
    // collect data from script
    python.stdout.on('data', function (data) {
        console.log('Pipe data from python script ...');
        dataToSend += data.toString();
        console.log(data.toString());
    });
    // in close event we are sure that stream from child process is closed
    python.on('close', (code) => {
        console.log(`child process close all stdio with code ${code}`);
        // send data to browser
        console.log(dataToSend);
        res.send(dataToSend);
        // res.send(req.body + " - " + dataToSend);
    });

})
app.listen(port, () => console.log(`BlurVideo Backend is listening on http://localhost:${port}`))
