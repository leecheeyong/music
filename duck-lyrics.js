const cheerio = require('cheerio');
const DDG = require('duck-duck-scrape');
const fs = require('fs');
const axios = require('axios');

;(async () => {
    const musics = fs.readdirSync('./music').filter(file => file.endsWith('.mp3'));
    for(let i in musics) {
    try {
    if(fs.existsSync(`./lyrics/${musics[i].slice(0, -4)}.txt`)) return console.log("Music Exist");
    console.log(`Fetching lyrics: ${musics[i].slice(0, -4)}`);
    const name = musics[i].slice(0, -4).toLowerCase()
    .split("lyrics").join("")
    .split("official").join("")
    .split("mv").join("")
    .split("video").join("")
    .split("audio").join("")
    .split("(").join("").split(")").join("")
    .split("[").join("").split("]").join("")
    .split("【").join("").split("】").join("")
    .split("「").join("").split("」").join("")
    .split("《").join("").split("》").join("")
    .split("♪").join("").split("動態歌詞").join("")
    .split("cover").join("").split("mp3").join("")
    .split("ost").join("").split("歌词版").join("")
    .split("4k").join("").replace(/\s+/g,' ').trim();
    
    const searchResults = (await DDG.search(`site:mojim.com ${name}`)).results.map(e=>e.url);
        
    console.log("Scraping Google");
        
    if(!searchResults[0]) throw new Error("Google Search not found");
    
    console.log("Scraping Mojim", searchResults[0]);
        
    const { data } = await axios({ url: `${searchResults[0]}` });
    const $ = cheerio.load(data);
    const lyrics = $('dd.fsZx3').toArray().map((x) => {
        const ele = $(x);
        ele.find("ol").remove();
        ele.find("a").remove();
        ele.find("br").replaceWith("\n");
        return ele.text().split("更多更詳盡歌詞 在").join("");
    })
    .join("\n")
    .trim();
    console.log("Processing Lyrics");
    if(!lyrics) throw new Error("Lyrics not found");
    fs.writeFileSync(`./lyrics/${musics[i].slice(0, -4)}.txt`, `${lyrics}`);
    console.log(`Lyrics: ${name}`);
    }catch(e) {
        console.log(e)
    }
    }
})();
