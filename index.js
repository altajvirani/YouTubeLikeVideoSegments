!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t(require("video.js")):"function"==typeof define&&define.amd?define(["video.js"],t):(e=e||self).videojsSpriteThumbnails=t(e.videojs)}(this,function(e){"use strict";var t=(e=e&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e).getPlugin("plugin"),o={url:"",width:0,height:0,interval:1,responsive:600},r=function(t){var r,i;function n(r,i){var n;return(n=t.call(this,r)||this).options=e.mergeOptions(o,i),n.player.ready(function(){!function(t,o){var r=o.url,i=o.height,n=o.width,a=o.responsive,p=e.dom||e,s=t.controlBar,u=s.progressControl,l=u.seekBar,d=l.mouseTimeDisplay;if(r&&i&&n&&d){var c=p.createEl("img",{src:r}),f=function(e){Object.keys(e).forEach(function(t){var o=e[t],r=d.timeTooltip.el().style;""!==o?r.setProperty(t,o):r.removeProperty(t)})},h=function(){var e=c.naturalWidth,u=c.naturalHeight;if(t.controls()&&e&&u){var h=parseFloat(d.el().style.left);if(h=t.duration()*(h/l.currentWidth()),!isNaN(h)){h/=o.interval;var g=t.currentWidth(),m=a&&g<a?g/a:1,v=e/n,b=n*m,y=i*m,x=Math.floor(h%v)*-b,k=Math.floor(h/v)*-y,j=e*m+"px "+u*m+"px",w=p.getBoundingClientRect(s.el()).top,O=p.getBoundingClientRect(l.el()).top,P=-y-Math.max(0,O-w);f({width:b+"px",height:y+"px","background-image":"url("+r+")","background-repeat":"no-repeat","background-position":x+"px "+k+"px","background-size":j,top:P+"px",color:"#fff","text-shadow":"1px 1px #000",border:"1px solid #000",margin:"0 1px"})}}};f({width:"",height:"","background-image":"","background-repeat":"","background-position":"","background-size":"",top:"",color:"","text-shadow":"",border:"",margin:""}),u.on("mousemove",h),u.on("touchmove",h),t.addClass("vjs-sprite-thumbnails")}}(n.player,n.options)}),n}return i=t,(r=n).prototype=Object.create(i.prototype),r.prototype.constructor=r,r.__proto__=i,n}(t);return r.defaultState={},r.VERSION="0.5.3",e.registerPlugin("spriteThumbnails",r),r});
   
var player = videojs(
    "my-video", {
        controls: true,
        fluid: true,
        html5: {
            vhs: {
                overrideNative: true,
            }, 
        },
        responsive: true,
    },
    function () {
        var player = this;
        player.eme();
        player.src({
            // src: "https://cdn.bitmovin.com/content/assets/art-of-motion_drm/mpds/11331.mpd",
            src: "./samplevideo.mp4",
            // type: "application/dash+xml",
            type: "video/mp4",
            keySystems: {
                "com.widevine.alpha":
                "https://cwip-shaka-proxy.appspot.com/no_auth",
            },
        });
    }
);

const segmentsData = [{
    start: "00:15",
    end: "01:00",
    title: "Segment 1",
    content: "This is segment 1.",
}, {
    start: "01:00",
    end: "01:40",
    title: "Segment 2",
    content: "This is segment 2.",
}, {
    start: "01:40",
    end: "02:00",
    title: "Segment 3",
    content: "This is segment 3.",
}, {
    start: "02:20",
    end: "02:50",
    title: "Segment 4",
    content: "This is segment 4.",
}];

const seekBar = player.controlBar.progressControl.seekBar;

if (player.readyState() < 1) {
    player.one("loadedmetadata", onLoadedMetadata);
}
else {
    onLoadedMetadata();
}

function onLoadedMetadata() {
    segmentsData.forEach((segment) => {
        console.log(timeStringToSeconds(segment.start), player.duration())
        const markerPosition = (timeStringToSeconds(segment.start)/60 / player.duration()) * 100;
    
        const marker = document.createElement("div");
        marker.setAttribute("class", "marker");
        marker.style.left = markerPosition + "%";
    
        marker.addEventListener("click", () => {
        player.currentTime(timeStringToSeconds(segment.start) / 60);
        });
    
        seekBar.el().appendChild(marker);
    });

    const markerStyle = document.createElement("style");
    markerStyle.textContent = `
        .marker {
            position: absolute;
            width: 0.8rem;
            height: 100%;
            background-color: #de3c3c;
        }
    `;
    document.head.appendChild(markerStyle);
}

const segmentsDiv = document.getElementById("video-segments");
segmentsData.map((segment, key) => {
    const div = document.createElement('div');
    div.setAttribute("id", `s${key + 1}`);
    div.setAttribute("class", "segment");
    div.setAttribute("style", "position: relative");
    div.textContent = segment.content;
    segmentsDiv.appendChild(div);
    div.onclick = function(event){
        player.currentTime(timeStringToSeconds(segment.start)/60);
    }
    const timeStamp = document.createElement('div');
    timeStamp.setAttribute("style", "background-color: #C2EBF0; position: absolute; margin-top: 0.6rem; margin-bottom: 0.6rem; top: 0; bottom: 0; right: 0.6rem; border-radius: 0.6rem; padding: 0.4rem 0.8rem; display: flex; align-items: center; justify-content:center");
    timeStamp.textContent = segment.start;
    div.appendChild(timeStamp);
});

const timeTooltip = player
        .getChild('controlBar')
        .getChild('progressControl')
        .getChild('seekBar')
        .getChild('mouseTimeDisplay')
        .getChild('timeTooltip')
        
function timeStringToSeconds(timeString) {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return (hours || 0) * 3600 + (minutes || 0) * 60 + (seconds || 0);
}

function isSeekedWithinSegment(startTime, seekTime, endTime) {
    return startTime <= seekTime && seekTime <= endTime;
}

timeTooltip.update = function (seekBarRect, seekBarPoint, time) {
    let seekTimeArr = timeStringToSeconds(time);
    segmentsData.map((segment)=>{
        if(isSeekedWithinSegment(timeStringToSeconds(segment.start), seekTimeArr, timeStringToSeconds(segment.end)))
            this.write(`${segment.title} [${time}]`)
    })
}

player.spriteThumbnails({
    interval:1,
    url: './sample.mp4.png',
    width: 160,
    height: 90
});
