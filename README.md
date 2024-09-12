Personal Video Streaming
A personal project to create a home server for streaming transcoded video to browsers.

This project enables users to set up a home server capable of streaming video content to any browser. It uses server-side video transcoding to ensure smooth playback across devices.

Features
Real-time video transcoding
Browser-compatible streaming
Easy to set up and configure
Installation
To install and run the project locally:

Clone the repository:
git clone https://github.com/wshood/Personal-video-streaming.git
cd Personal-video-streaming

Setup:
This project does require Node.js installed in order to run
and the following dependencies are required by the server:
ejs
express
socket.io
fluent-FFMPEG
FFMPEG
mongodb

Once all of those are installed, go to Mongodb, and create a database, with a collection, and import a document with the format provided in database.json to add media
Setup the file strucure as listed in configuration to ensure correct functionality.

Usage
To start the server, run the following command:

node server.js
The server will start on localhost:3000, where you can access the video streaming interface.

Configuration
The project uses default settings for video streaming. To customize default video settings, edit the player.js file.
Ensure that video files are placed in the appropriate directory for streaming.
File Structure
/views       # Front-end templates
/server.js   # Main server code
/Posters     #Images used for video identification on homepage
/Movies      #Location for videofiles
/Stylesheets #location for any css on your site

Technologies Used
JavaScript: For server-side functionality
EJS: Embedded JavaScript templating for views
HTML: Basic front-end structure

TODO:
These are features that I will actively try to implement further down the line of development:
Switch from WebM output to HLS streaming (for better output and Iphone support)
Search feature on frontpage

Contributing
Feel free to submit issues or pull requests.

License
This project is licensed under the MIT License.
