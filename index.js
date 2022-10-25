const PLAYLIST_ID = "PLqpN-gSREHXwYRIsjw8Qmh0QjJH_7ZwxK";
const ffmpeg = require('fluent-ffmpeg');
const getSize = require('get-folder-size');
const ytdl = require('ytdl-core');
const search = require("youtube-sr").default;
const fs = require('fs');
const { Collection } = require('@discordjs/collection');
const collection = new Set();
const collection2 = new Collection();
const path = require('path');
const downloaded = [];
const cannot = [ ];
const content = [];
const playlist = [];

const all = [];
var trackNumber = 0;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const getAudio = (video) => new Promise((resolve, reject) => {
    var stream = ytdl(video?.url, { filter: 'audioonly' });
    var file = fs.createWriteStream(`./music/${video?.title.split("/").join(" ").split(".").join(" ")}.mp3`);
    ffmpeg(stream)
    .format('mp3') 
    .save(file) 
    .on('end', () => {
        collection.add(`${video?.title}`); 
        resolve(`Done ${video?.title}`);
    })  
});        

async function run() {
    const dir = fs.readdirSync('./music').filter(file => file.endsWith('.mp3'));
    for (i in dir) {
        collection.add(dir[i].slice(0, -4));
        downloaded.push(dir[i].slice(0, -4));
    }      
    await wait(5000);  
    const data = (await search.getPlaylist(PLAYLIST_ID).then(playlist => playlist.fetch()));
    if(!Array.isArray(data?.videos)) throw new Error("No videos found"); 
     var videos = data.videos;  
     for(i in videos) { 
        all.push(videos[i].title);   
        collection2.set(videos[i].title, videos[i].url);
       if(!collection.has(videos[i]?.title.split("/").join(" ").split(".").join(" "))) { 
         console.log(await getAudio(videos[i]));  
         downloaded.push(videos[i]?.title);
         console.log(downloaded.length, videos.length, i)
       }   
    }
    console.log(all.length, downloaded.length);
    const music = fs.readdirSync('./music').filter(file => file.endsWith('.mp3'));
    for(i in music){
      trackNumber++;
        content.push({
            title: `${encodeURIComponent(music[i].slice(0, -4))}`,
            track: `./music/${encodeURIComponent(music[i])}`,
            trackNumber
        })
      }
    for (let i = 0; i < content.length; i += 20) {
         playlist.push(content.slice(i, i + 20));
    }
    playlist.forEach((e, i) => {
          fs.writeFileSync(`./playlist/playlist-${i}.json`, JSON.stringify({
            page: i,
            list: e,
            totalPages: playlist.length
        }));
    })
    fs.writeFileSync(`./playlist/playlist.json`, JSON.stringify(content));
    const statsPlaylist = fs.statSync("./playlist/playlist.json");
    const playlistMB = statsPlaylist.size / (1024*1024);
    getSize('./music', (err, size) => {
        fs.writeFileSync(`./stats.md`, `
        # Github Player Stats
        
        ## Total Audio: ${music.length}
        ## Total Size Of Audio: ${(size / 1024 / 1024).toFixed(2) + ' MB'}
        ## Playlist Index File Size: ${playlistMB}
        `);
    })
};

run();


process.on('uncaughtException', async function (err) {
   console.log(err)
});  
