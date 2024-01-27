const { getPlaylistID } = require("../utils/helpers");
const { parse, toSeconds } = require("iso8601-duration");

const YT_API_KEY = process.env.YT_DATA_API_KEY;

exports.getPlaylistData = async (req, res) => {
  const playlistURL = req.body.url;

  const playlistID = getPlaylistID(playlistURL); //getting playlist ID

  if (playlistID === "") {
    //checking if the link is valid or not
    const data = {
      ok: false,
      error: `Invalid Link... "list" parameter not found !`,
    };
    res.status(400).json(data);
    return;
  }

  let nextPageToken = ""; // to fetch next page of the playlist items api call response

  const limit = 300; // as i have 10,000 units/ day,we'll limit playlist to 300 vids
  let count = 0; //count of total number of videos
  let playlist_length = 0; //will contain total duration of playlist in seconds
  let unavailable_vids = 0; // count of total num of unavailable videos

  //API endpoint to get video IDs of the playlist videos.
  const URL1 = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50&fields=items/contentDetails/videoId,nextPageToken&key=${YT_API_KEY}&playlistId=${playlistID}&pageToken=`;

  while (true) {
    const video_list1 = []; //for storing  Video IDs of the playlist items response of URL1
    const video_list2 = []; // for storing video ids of return response of URL2
    const vid_iso_duration = []; //for storing video duration which are in ISO-8601 format
    let playlistContent; //declaring here so that we can access it outside try scope.

    try {
      const response = await fetch(URL1 + nextPageToken);
      if (!response.ok) {
        throw new Error(response.status);
      }

      playlistContent = await response.json();

      //adding retrieved Video IDs to array
      //it also has IDs of hidden/unavailable videos in the playlist
      video_list1.push(
        ...playlistContent.items.map((item) => item.contentDetails.videoId)
      );
    } catch (err) {
      //error handling
      console.log(err);
      let data = "";
      if (err.message == 404) {
        data = {
          ok: false,
          error: `Invalid Link... Make sure you paste the correct link !`,
        };

        res.status(404).json(data);
        return;
        
      } else {
        //    errorDiv.innerHTML=`Some error occurred... Pls Try again!`
        data = { ok: false, error: `Some error occurred... Pls Try again!` };
      }

      res.status(404).json(data);
        return;
    }

    count += video_list1.length; //adding no. of videos ID fetched to count

    // max limit is 50 video IDs
    let videoIds = video_list1.join(","); //string of comma separated video Ids for next api call

    //API endpoint to get video details
    const URL2 = `https://www.googleapis.com/youtube/v3/videos?&part=contentDetails&id=${videoIds}&key=${YT_API_KEY}&fields=items/id,items/contentDetails/duration`;

    try {
      const response = await fetch(URL2);
      if (!response.ok) {
        throw new Error(response.status);
      }

      const data = await response.json();

      video_list2.push(...data.items.map((item) => item.id));
      vid_iso_duration.push(
        ...data.items.map((item) => item.contentDetails.duration)
      );
    } catch (err) {
      console.log(err);
      const data = {
        ok: false,
        error: `Some error occurred... Pls Try again!`,
      };
      res.status(500).json(data);
      return;
    }

    //finding total num of unavailable/hidden videos as we can't fetch it's details
    video_list1.forEach((item) => {
      if (video_list2.indexOf(item) == -1) {
        unavailable_vids++;
      }
    });

    //converting each ISO8601 duration string to seconds and adding it to playlist_length
    vid_iso_duration.forEach((item) => {
      playlist_length += toSeconds(parse(item));
    });

    //checking if nextPageToken exists and count<limit
    if (playlistContent.nextPageToken !== undefined && count < limit) {
      nextPageToken = playlistContent.nextPageToken;
    } else {
      break;
    }
  }

  //API endpoint to Youtube playlist title, description and Thumbnail
  const URL3 = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistID}&key=${YT_API_KEY}&&fields=items/snippet/title,items/snippet/thumbnails/medium/url,items/snippet/channelTitle`;

  //fetch Youtube playlist title, description and Thumbnail
  let playlist_metaData;
  try {
    const response = await fetch(URL3);
    if (!response.ok) {
      throw new Error(response.status);
    }

    playlist_metaData = await response.json();
  } catch (err) {
    console.log(err);
    const data = { ok: false, error: `Some error occurred... Pls Try again!` };
    res.status(500).json(data);
    return;
  }

  //adding some props to playlist_metadata object
  playlist_metaData.items[0].snippet.ok = true;
  playlist_metaData.items[0].snippet.count = count;
  playlist_metaData.items[0].snippet.unavailable_vids = unavailable_vids;

  const data = {
    duration: playlist_length,
    metaData: playlist_metaData.items[0].snippet,
  };

  res.status(200).json(data);
};
