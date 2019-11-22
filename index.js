const size = require("screenres");
const fs = require("fs");
const {spawn} = require("child_process");

class Recorder {
    constructor(params){
        if (!params) params = {};

        this.screen = size.get();
        this.w = params.width || this.screen[0];
        this.h = params.height || this.screen[1];
        this.x = params.x || 0;
        this.y = params.y || 0;
        this.fps = params.fps || 25;
        this.path = params.path || ".";
        this.recorder = params.recorder || "x11grab";
        this.filepath = null;
        this.process = null;
        if (params.webServer){
            this.attacheWebPlayer();
        }
        this.validate();
    }
    attacheWebPlayer(){
        const http =require("http");
        const path = require('path');
        const url = require('url');

        http.createServer((req,res)=>{
            if (req.url.indexOf("/home") !== -1){
                let queryData = url.parse(req.url, true).query;
                if (!queryData.file){
                    res.end("file parameter required");
                    return;
                }
                if (!fs.readFileSync(queryData.file)){
                    res.end("No Such File")
                }

                let html = fs.readFileSync("./player/index.html","utf-8");
                html = html.replace("{{path}}","/"+queryData.file);
                res.end(html);
            }else if(path.extname(req.url) === ".mp4"){
                const path = this.path+req.url;
                const stat = fs.statSync(path);
                const fileSize = stat.size;
                const range = req.headers.range;

                if (range) {
                    const parts = range.replace(/bytes=/, "").split("-")
                    const start = parseInt(parts[0], 10)
                    const end = parts[1]
                        ? parseInt(parts[1], 10)
                        : fileSize-1

                    const chunksize = (end-start)+1;
                    const file = fs.createReadStream(path, {start, end})
                    const head = {
                        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                        'Accept-Ranges': 'bytes',
                        'Content-Length': chunksize,
                        'Content-Type': 'video/mp4',
                    }

                    res.writeHead(206, head)
                    file.pipe(res)
                } else {
                    const head = {
                        'Content-Length': fileSize,
                        'Content-Type': 'video/mp4',
                    }
                    res.writeHead(200, head)
                    fs.createReadStream(path).pipe(res)
                    }
            }
            console.log(req.url);
        }).listen(8080);
    }
    fileName(){
        let d = new Date();
        let h = d.getHours();
        if (h < 10){h = "0"+h}
        let m = d.getMinutes();
        if (m < 10){m = "0"+m}
        let s = d.getSeconds();
        if (s < 10){s = "0"+s}
        return `${h}:${m}:${s}`;
    }
    validate(){
       if (this.w  > this.screenWidth){
           console.log("BIG")
            throw new Error(`\x1b[31m
            You screen width is ${this.screenWidth} 
            but you trying to record ${this.w}
            recording area can't be bigger then you'r screen
           \x1b[0m`)
       }
       if (this.h > this.screenHeight){
            throw new Error(`\x1b[31m
            You screen height is ${this.screenHeight} 
            but you trying to record ${this.h}
            recording area can't be bigger then you'r screen
            \x1b[0m`);
       }
       if (this.x > this.screenWidth || this.x  < 0){
            throw new Error(`\x1b[31m
            Recoding x position invalid..
            it must be not big then you'r screen area 
            or smaller then 0
            \x1b[0m`);
       }
       if (this.y > this.screenHeight || this.y < 0){
           throw new Error(`\x1b[31m
            Recoding y position invalid..
            it must be not big then you'r screen area 
            or smaller then 0
            \x1b[0m`);
       }
       if (!fs.existsSync(this.path)){
           throw new Error(`\x1b[31m
            Invalid path for recording
            \x1b[0m`);
       }
    }
    record(){
        this.filepath = this.path+"/"+this.fileName()+".mp4";
        let args=  [
            '-video_size',
            this.w+"x"+this.h,
            '-framerate',
            this.fps,
            '-f',
            this.recorder,
            '-i',
            ':0.0+'+this.x+","+this.y,
            this.filepath
        ];
        this.process = spawn("ffmpeg",args);
        this.process.stderr.on("error",(data)=>{
          throw new Error(`\x1b[31m${data.error}\x1b[0m`);
        });
        console.log("\x1b[32mRecording...\x1b[0m");
    }
    stop(){
        if (this.process != null){
            this.process.kill('SIGINT');
        }else{
            console.log("No Such Process");
        }
    }

    get width(){ return this.w; }

    get height(){ return this.h;}

    get screenWidth(){ return this.screen[0]}

    get screenHeight(){ return this.screen[1]}

    get filePath(){return this.filepath }

    get X(){
        return this.x;
    }
    get Y(){
        return this.y;
    }

}
let options = {
    width:1280,
    //width is recording area size horizontal.
    //not required (<<Integer>> default value is device screen width),
    height:720,
    // height is recording area size vertical
    // not required (<<Integer>> default value is device screen height),
    x:0,
    // x is horizontal offset of the recording area
    // not required (<<Integer>> default value 0)
    y:0,
    // y is vertical offset of the recording area
    // not required (<<Integer>> default value 0)
    fps : 20,
    // Frame Per Second to record
    // not required (<<Integer>> default value 25)
    path : ".",
    // path where the recording file will be saved
    // not required (<<String>> default value ".")
    webServer:true,
    // attaching web server on 8080 port for testing recorded file
    // open in your browser (http://{host}:8080/home?file={filename}.mp4)
    // not required (<<Boolean>> default value false))
};

let r = new Recorder(options);

r.screenHeight; //return device screen height
r.screenWidth; //returns device screen width
r.height; //returns recording screen height
r.width; //returns recording screen width
r.filePath; //returns recording file path
r.X; //returns recording horizontal offset
r.Y; //returns recording vertical offset

r.record(); //start recording
r.stop(); //stop recording

module.exports = Recorder;
