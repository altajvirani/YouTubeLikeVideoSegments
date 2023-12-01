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
            src: "https://cdn.bitmovin.com/content/assets/art-of-motion_drm/mpds/11331.mpd",
            type: "application/dash+xml",
            keySystems: {
                    "com.widevine.alpha":
                    "https://cwip-shaka-proxy.appspot.com/no_auth",
                },
            });
            player.ready(function () {
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
    end: "02:00",
    title: "Segment 2",
    content: "This is segment 2.",
}, {
    start: "02:00",
    end: "03:00",
    title: "Segment 3",
    content: "This is segment 3.",
}, {
    start: "03:00",
    end: "03:30",
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
    timeStamp.setAttribute("style", "background-color: #c2ebf0; position: absolute; margin-top: 0.6rem; margin-bottom: 0.6rem; top: 0; bottom: 0; right: 0.6rem; border-radius: 0.6rem; padding: 0.4rem 0.8rem; display: flex; align-items: center; justify-content:center");
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
