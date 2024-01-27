exports.getPlaylistID= (link) =>{
    // Extract the playlist ID from the link
    let playlistId = "";
    if (link.includes("list=")) {
      const arr = link.split("list=");
      playlistId = arr[1];
      const ampersandIndex = playlistId.indexOf("&");
  
      if (ampersandIndex !== -1) {
        playlistId = playlistId.substring(0, ampersandIndex);
      }
    } else {
      // The link doesn't contain a playlist ID
      console.error("Invalid playlist link:", link);
      //also display it to the user that it doesn't contain "list=" parameter or it's invalid playlist link
    }
  
    return playlistId;
  }
