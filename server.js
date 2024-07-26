const path = require("path");
const express = require('express');
const serveIndex = require("serve-index");
const ffmpeg = require('fluent-ffmpeg');
const {MongoClient} = require('mongodb');
const uri="your-mongodb-link-here";
const ejs = require('ejs');
const app = express();
app.set('view engine', 'ejs');
const ROOT = path.join(__dirname, "/");
const fs = require('fs');
ffmpeg.setFfmpegPath('your-ffmpeg-path-here');
ffmpeg.setFfprobePath('your-ffmpeg-probe-path-here');

//function to retrieve content from the database to the homepage
async function movieList(){
 const client = new MongoClient(uri);
  try {
    // Connect to the MongoDB cluster
    await client.connect();

    const cursor = client.db('your-database-here').collection('your-collection-here').find({season:'1', episode:'1'});
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
//renders homepage for media selection
app.get("/", (req, res) => {
  const result = movieList().then(movies=>{
    res.render('home', {movies: movies});
  });
});

//dynamically retrieves and streams desired video content
app.get('/video/:filename', (req,res) => {
  ffmpeg('./Movies/'+req.params.filename+'desired file type here')
  .format('same file format as above')
  .on('end', function(){
    console.log('file has been converted successfully');
  })
  .on('error', function(err){
    console.log('an error happened: ' + err.message);
  })
  .pipe(res, {end:true});

});

//dynamically renders video playback pages
app.get('/media/:filename', (req,res)=>{
  var title = req.params.filename;
  const result = moviePlayer(title).then(movie=>{
    res.render('player', {movie: movie});
  });
});

//function to find all relevant media to a title
async function moviePlayer(title){
  const client = new MongoClient(uri);
   try {
     // Connect to the MongoDB cluster
     await client.connect();
 
     const cursor = client.db('your-database-here').collection('your-collection-here').find({movie:title});
     const results = await cursor.toArray();
     
     return results;
 
 } catch (e) {
     console.error(e);
 } finally {
     await client.close();
 }
 }
 movieList().catch(console.error);

app.listen(3000, ()=>{
  console.log('server is running on port 3000');  
});