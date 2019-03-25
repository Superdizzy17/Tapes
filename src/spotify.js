//document.getElementById("trackName").innerHTML = "";
//document.getElementById("albumName").innerHTML = "";
//document.getElementById("artistName").innerHTML = "";

// Variables
playback = 
"<div id=\"playback-container\" class=\"row\">" +
    "<div class=\"col s4 offset-s1\">" +
    "<br><br>" +
    "<h4 class=\"header\">Now Playing</h4>" +
        "<div class=\"row purple darken-1 wrapper\">" +
            "<div class=\"card horizontal grey lighten-5\">" + 
                "<div class=\"card-image\">" +
                    "<img id=\"albumArt\" src=\"\">" +
                "</div>" +
                "<div class=\"card-stacked\">" +
                    "<div class=\"card-content\">" +
                        "<h3 id=\"trackName\"></h3>" +
                        "<h6 id=\"albumName\"></h6>" +
                        "<h6 id=\"artistName\"></h6>" +
                    "</div>" +
                "</div>" +
            "</div>" +
        "</div>" +
    "</div>" +
"</div>";

instructions = 
"<div class=\"row\">" + 
    "<div class=\"col s8 offset-s2\">" +
     "<br><br>" +
        "<div class=\"card-panel grey lighten-5 z-depth-1\">" +
            "<div class=\"row valign-wrapper\">" +
                "<div class=\"col s2\">" +
                    "<img src=\"./assets/instructions.gif\"/>" +
                "</div>" +
                "<div class=\"col s6\">" +
                    "<h4>Control Playback</h4>" + 
                    "<span class=\"black-text\">" +
                        "In order to connect to the Spotify Player please follow the following instructions:" +
                        "<br><br>" +
                        "<b>1.</b> Fire up the Spotify app on your phone, laptop or tablet." +
                        "<br>" +
                        "<b>2.</b> Play a song and select Devices Available." +
                        "<br>" +
                        "<b>3.</b> Select Tapes as your device and start listening." +
                    "</span>" +
                "</div>" +
            "</div>" +
        "</div>" +
    "</div>" +
"</div>";

//Click event for sign in functionality
let login = document.getElementById("signin").onclick = function() 
{
    location.href = "http://localhost:8888/login";
}

//Parse authentication token passed from server to client via browser url and store in local storage
let parsed = window.location.search.substr(1);
let parsedToken = parsed.slice(13);

localStorage.setItem('accessToken', parsedToken);
let accessToken = localStorage.getItem('accessToken');

// If user is signed in then proceed to display the playback instructions
if(accessToken.length > 1)
{
    fetch('https://api.spotify.com/v1/me',{
        method: 'get',
        headers: { 'Authorization': 'Bearer ' + accessToken},
    })
    .then(res =>  res.json())
    .then(function(res) {
        console.log(res);
        document.getElementById("signin").src = res.images[0].url;
        document.getElementById("playback").innerHTML = instructions;
    });
}

/*/Click event for search button 
document.getElementById("search").onclick = function()
{
    let query = document.getElementById("query").value;
    console.log(query);
    Search(accessToken,query, 10);
};*/

//Search function to search for artist/track
function Search(accessToken, query, limit)
{
    fetch('https://api.spotify.com/v1/search?q=' 
    + query 
    + '&type=' + 'track%2Cartist' 
    + '&market=US' 
    + '&limit=' + limit 
    + '&offset=5', {
        method: 'get',
        headers: { 'Authorization': 'Bearer ' + accessToken},
    })
    .then(res =>  res.json())
    .then(function(res) {
 
        console.log(res);
        document.getElementById("results").innerHTML = null;

        //Loop through search results and display them on screen
        for(let i=0; i<10; i++)
        {
            document.getElementById("results").innerHTML += "<div class=\"result\"><img class=\"artWork\" src="
            + res.tracks.items[i].album.images[2].url + ">" 
            + "<h1>" + res.tracks.items[i].name + "</h1>"
            + "<h2>" + res.tracks.items[i].album.name + "</h2>"
            + "<h3>" + res.tracks.items[i].artists.map(artist => artist.name).join(", ") + "</h3>"
            + "</div>";
        }

    });
}

// Retrieve Spotify topSongs
function spotify_topSongs(accessToken)
{
    url="https://api.spotify.com/v1/playlists/37i9dQZEVXbMDoHDwVN2tF"

    return fetch(url,{
        method: 'get',
        headers: { 'Authorization': 'Bearer ' + accessToken}})
    .then(res => res.json())
    .catch(error => console.log(error))
}

//Call Spotify Player and initiate player
//Allows user playback in web browser from any device
window.onSpotifyWebPlaybackSDKReady = () => {
    const player = new Spotify.Player({
      name: 'Tapes',
      getOAuthToken: cb => { cb(accessToken); }
    });

    //Error handling
    player.addListener('initialization_error', ({ message }) => { console.error(message); });
    player.addListener('authentication_error', ({ message }) => { console.error(message); });
    player.addListener('account_error', ({ message }) => { console.error(message); });
    player.addListener('playback_error', ({ message }) => { console.error(message); });
  
    //Playback status updates
    player.addListener('player_state_changed', state => { 
        
        console.log(state); 

        //Change DOM and display current track information
        let trackName = state.track_window.current_track.name;
        let albumName = state.track_window.current_track.album.name;
        let artistName = state.track_window.current_track.artists
                        .map(artist => artist.name)
                        .join(", ");
        let albumArt = state.track_window.current_track.album.images[2].url;

        document.getElementById("playback").innerHTML = playback;

        document.getElementById("albumArt").src = albumArt;
        document.getElementById("trackName").innerHTML = trackName;
        document.getElementById("albumName").innerHTML = albumName;
        document.getElementById("artistName").innerHTML = artistName;

        //Change DOM and display next track information
        let nexttrackName = state.track_window.next_tracks[0].name;
        let nextalbumName = state.track_window.next_tracks[0].album.name;
        let nextartistName = state.track_window.next_tracks[0].artists
                        .map(artist => artist.name)
                        .join(", ");
        let nextalbumArt = state.track_window.next_tracks[0].album.images[0].url;

        insertNext();

        document.getElementById("nextalbumArt").src = nextalbumArt;
        document.getElementById("nexttrackName").innerHTML = nexttrackName;
        document.getElementById("nextalbumName").innerHTML = nextalbumName;
        document.getElementById("nextartistName").innerHTML = nextartistName;

        //Change DOM and display previous track information
        //If previous track exists add it

        if(state.track_window.previous_tracks[0] != null)
        {
            let prevtrackName = state.track_window.previous_tracks[1].name;
            let prevalbumName = state.track_window.previous_tracks[1].album.name;
            let prevartistName = state.track_window.previous_tracks[1].artists
                            .map(artist => artist.name)
                            .join(", ");
            let prevalbumArt = state.track_window.previous_tracks[1].album.images[0].url;

            insertPrev();

            document.getElementById("prevalbumArt").src = prevalbumArt;
            document.getElementById("prevtrackName").innerHTML = prevtrackName;
            document.getElementById("prevalbumName").innerHTML = prevalbumName;
            document.getElementById("prevartistName").innerHTML = prevartistName;
        }


    });
  
    //Ready
    player.addListener('ready', ({ device_id }) => {
      console.log('Ready with Device ID', device_id);
    });
  
    //Not Ready
    player.addListener('not_ready', ({ device_id }) => {
      console.log('Device ID has gone offline', device_id);
    });
  
    //Connect to the player!
    player.connect();

    /*/Click event for previous track button 
    document.getElementById("prev").onclick = function()
    {
        player.previousTrack();
    };

    //Click event for play/pause button 
    document.getElementById("play").onclick = function()
    {
        player.togglePlay();
    };

    //Click event for next track button 
    document.getElementById("next").onclick = function()
    {
        player.nextTrack();
    };*/
}

function insertPrev()
{
    div = document.createElement("div"); 

    var id = document.createAttribute("id");
    id.value = "previous";                           
    div.setAttributeNode(id);
  
    var att = document.createAttribute("class");
    att.value = "col s2 offset-s1";                           
    div.setAttributeNode(att);
  
    var row = document.getElementById("playback-container");
    row.insertBefore(div, row.childNodes[0]);
  
    document.getElementById("previous").innerHTML =
    "<br><br><br><br><br>" +
    "<h4 class=\"header\">Previous</h4>" +
        "<div class=\"row pink wrapper\">" +
            "<div id=\"prevTrack\" class=\"card hoverable horizontal grey lighten-5\">" + 
                "<div class=\"card-image\">" +
                    "<img id=\"prevalbumArt\" src=\"\">" +
                "</div>" +
                "<div class=\"card-stacked\">" +
                    "<div class=\"card-content\">" +
                        "<h5 id=\"prevtrackName\"></h5>" +
                        "<h6 id=\"prevalbumName\"></h6>" +
                        "<h6 id=\"prevartistName\"></h6>" +
                    "</div>" +
                "</div>" +
            "</div>" +
        "</div>" +
    "</div>";

}

function insertNext()
{
    div = document.createElement("div"); 

    var id = document.createAttribute("id");
    id.value = "next";                           
    div.setAttributeNode(id);
  
    var att = document.createAttribute("class");
    att.value = "col s2 offset-s1";                           
    div.setAttributeNode(att);
  
    var row = document.getElementById("playback-container");
    row.appendChild(div)
    
    document.getElementById("next").innerHTML =
    "<br><br><br><br><br>" +
    "<h4 class=\"header\">Next</h4>" +
        "<div class=\"row pink wrapper\">" +
            "<div id=\"nextTrack\" class=\"card hoverable horizontal grey lighten-5\">" + 
                "<div class=\"card-image\">" +
                    "<img id=\"nextalbumArt\" src=\"\">" +
                "</div>" +
                "<div class=\"card-stacked\">" +
                    "<div class=\"card-content\">" +
                        "<h5 id=\"nexttrackName\"></h5>" +
                        "<h6 id=\"nextalbumName\"></h6>" +
                        "<h6 id=\"nextartistName\"></h6>" +
                    "</div>" +
                "</div>" +
            "</div>" +
        "</div>" +
    "</div>";
}