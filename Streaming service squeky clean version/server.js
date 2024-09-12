const path = require("path");
const express = require('express');
const serveIndex = require("serve-index");
const ffmpeg = require('fluent-ffmpeg');
const {MongoClient} = require('mongodb');
const uri="mongodb://localhost:27017";
const ejs = require('ejs');
const app = express();
const http = require('http');
app.set('view engine', 'ejs');
const ROOT = path.join(__dirname, "/");
const fs = require('fs');
ffmpeg.setFfmpegPath('FFMPEG path');
ffmpeg.setFfprobePath('FFMPEG pro path');
const cluster = require('cluster');
const numCPUS = require('os').availableParallelism();
const {Worker} = require('worker_threads');
const socketIO = require('socket.io');
let server = http.createServer(app);
const io = socketIO(server);

async function movieList(){
 const client = new MongoClient(uri);
  try {
    // Connect to the MongoDB cluster
    await client.connect();

    const cursor = client.db('Your Database').collection('Your media library').find({season:'1', episode:'1'});
    const results = await cursor.toArray();
    return results;

} catch (e) {
    console.error(e);
} finally {
    await client.close();
}
}
movieList().catch(console.error);


app.use('_', (req,res)=>{
    res.append("Cross-Origin-Opener-Policy", "same-origin");
    res.append("Cross-Origin-Embedder-Policy", "require-corp");
    next();
});
app.use(express.static(ROOT));
app.use(express.static(__dirname +'/flowplayer'));
app.get("/", (req, res) => {
  const result = movieList().then(movies=>{
    res.render('home', {movies: movies});
  });
});

//Plays video inside a worker thread
app.get('/video/:filename', async (req,res) => {
  var moviepath = './Movies/'+req.params.filename+'.mkv';
  fs.stat(moviepath, (err, stat)=>{
    if(err){
      return res.status(404).send('File not found');
    }

    var fileSize = stat.size;
    res.writeHead(200, {
      'Content-Type':'webm',
      'Content-Length':fileSize
    });
    //This streams the video
    const worker=new Worker('./player.js', {workerData: {src: moviepath}});
    worker.on('message', (message) => {
      if (message.type === 'data'){
        res.write(message.chunk);
      }else if(message.type === 'done'){
        res.end();
        console.log('File has been converted successfully');
      }else if (message.startsWith('error')){
        console.log('Error converting files: '+message.slice(6));
      }else{
        console.log(message);
      }
    });
    worker.on('error', (err) => {
      console.error(err);
      res.status(500).send('Internal Server Error');
    });
    //this kills the video on tab closure
    io.on('connection', (socket) => {
      socket.on('stop', () => {
        worker.postMessage('kill');
        console.log('Session closed');
      });
    });
  });
});

//Renders the media player site with the correct information
app.get('/media/:filename', (req,res)=>{
  var title = req.params.filename;
  const result = moviePlayer(title).then(movie=>{
    res.render('player', {movie: movie});
  });
});

//Retrieves the list of currently available content
async function moviePlayer(title){
  const client = new MongoClient(uri);
   try {
     // Connect to the MongoDB cluster
     await client.connect();
 
     const cursor = client.db('Your Database here').collection('Your media library').find({movie:title});
     const results = await cursor.toArray();
     console.log(results.length);
     if(results.length>0){
       results.forEach((result, i) => {
         console.log(i);
         console.log(`${result.movie}`);
         console.log(`${result.poster}`);
       });
     }
     return results;
 
 } catch (e) {
     console.error(e);
 } finally {
     await client.close();
 }
 }
 movieList().catch(console.error);

server.listen(3000);
