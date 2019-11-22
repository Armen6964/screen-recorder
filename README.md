<h1>Device Screen Recorder</h1>

<p>
Current version required 
**ffmpeg** 
installation on device 
and working only on 
linux based operating systems
</p>

<h3>Usage</h3>
<p>

    const Recorder = require("linux-screen-recorder");
    let r = new Recorder();
    r.record(); // start recording
   
</p>

<h3>Options</h3>

<p>
    
    const Recorder = require("linux-screen-recorder");
   
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
    r.record();
    
</p>

<h3>Api</h3>

<p>

    r.screenHeight; //returns device screen height
    r.screenWidth; //returns device screen width
    r.height; //returns recording screen height
    r.width; //returns recording screen width
    r.filePath; //returns recording file path
    r.X; //returns recording horizontal offset
    r.Y; //returns recording vertical offset
    
    r.record(); //start recording
    r.stop(); //stop recording


</p>

<h1>TODO List</h1>

<p>1) Setup recording with audio </p>
<p>2) Setup recording for Windows </p>
<p>2) Setup recording for Mac </p>
