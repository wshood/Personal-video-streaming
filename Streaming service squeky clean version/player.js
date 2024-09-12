const {parentPort, workerData} = require('worker_threads');
const ffmpeg = require('fluent-ffmpeg');
const { PassThrough } = require('stream');
ffmpeg.setFfmpegPath('Your FFMPEG path');
ffmpeg.setFfprobePath('Your FFPROBE path');
const {src} = workerData;
const output = new PassThrough();
//This below converts the video from mpeg2 to webm. The bitrate is so low due to system limitations, but it can run higher.
var command = ffmpeg(src)
    .inputOptions(['-c:v mpeg2video'])
    .outputOptions(['-c:a libvpx-vp9', '-c:a libopus', '-b:v 128k','-ac 2', '-preset ultrafast', '-speed 6'])
    .format('webm')
    .on('end', function(){
      parentPort.postMessage('done');
    })
    .on('exit', () => {
      parentPort.postMessage('Stream exited');
    })
    .on('close', () => {
      parentPort.postMessage('Stream closed');
    })
    .on('error', function(err){
      parentPort.postMessage('error:  ' + err.message);
    }).on('stderr', function(stderr){
      parentPort.postMessage('stderr:  ' + stderr);
    })
    .pipe(output, {end: true})
output.on('data', (chunk) => {
  parentPort.postMessage({type:'data', chunk});
})
parentPort.on('message', (message) => {
  parentPort.postMessage(message);
    if(message === 'kill'){
      parentPort.postMessage('Stream killed');
      process.exit();
    }
});