const {
  getTimeComponents,
  getTotalDuration,
  getPlaylistID,
} = require("../utils/helpers");

const apiKey = process.env.youtube_data_api_key;

exports.getPlaylistData = async (req, res) => {
  const playlistURL = req.body.url;

  const playlistID = getPlaylistID(playlistURL); //getting playlist ID

  if (playlistID === "") {
    //checking if the link is valid or not

    //   errorDiv.innerHTML=`Invalid Link... "list" parameter not found !`
    //   loader.classList.add("hide");
    //   errorDiv.classList.remove("hide");

    const data = {
      ok: false,
      error: `Invalid Link... "list" parameter not found !`,
    };
    res.send(JSON.stringify(data));
    // res.json(response)  -> this will also do the same work as above code

    return;
  }

  let nextPageToken = ""; // to fetch next page of the playlist items api call response

  const limit = 500; // as we have 10,000 units/ day,we'll limit playlist to 500 vids which is the most reasonable num.
  let count = 0; //final count of total number of videos
  const final_vid_dur = []; //will contain final Js object time durations total/page i.e maxx=10
  let unavailable_vids = 0; // for storing total num of unavailable videos

  //api to get video IDs of the playlist videos.
  const URL1 = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50&fields=items/contentDetails/videoId,nextPageToken&key=${apiKey}&playlistId=${playlistID}&pageToken=`;

  while (true) {
    const video_list1 = []; //for storing  Video IDs of the playlist items response of URL1
    const video_list2 = []; // for storing video ids of return response of URL2
    const vid_iso_duration = []; //for storing video duration which are in ISO-8601 format
    const vid_duration_converted = [];
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
      console.log(err);
      let data = "";
      if (err.message == 404) {
        //    errorDiv.innerHTML=`Invalid Link... Make sure you paste the correct link !`
        data = {
          ok: false,
          error: `Invalid Link... Make sure you paste the correct link !`,
        };
      } else {
        //    errorDiv.innerHTML=`Some error occurred... Pls Try again!`
        data = { ok: false, error: `Some error occurred... Pls Try again!` };
      }
      //   loader.classList.add("hide");
      //   errorDiv.classList.remove("hide");

      res.send(JSON.stringify(data));
      return;
    }

    count += video_list1.length; //adding no. of videos ID fetched to count

    // max limit is 50 video IDs
    let videoIds = video_list1.join(","); //string of comma separated video Ids for next api call

    //api to get video details
    const URL2 = `https://www.googleapis.com/youtube/v3/videos?&part=contentDetails&id=${videoIds}&key=${apiKey}&fields=items/id,items/contentDetails/duration`;

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
      //   errorDiv.innerHTML=`Some error occurred... Pls Try again!`
      //   loader.classList.add("hide");
      //   errorDiv.classList.remove("hide");

      const data = {
        ok: false,
        error: `Some error occurred... Pls Try again!`,
      };
      res.send(JSON.stringify(data));
      return;
    }

    //finding total num of unavailable
    video_list1.forEach((item) => {
      if (video_list2.indexOf(item) == -1) {
        unavailable_vids++;
      }
    });

    //converting each ISO8601 duration string to human readable Js Object
    vid_iso_duration.forEach((item) => {
      vid_duration_converted.push(getTimeComponents(item));
    });

    //adding total video duration of current page to final_vid_dur array
    final_vid_dur.push(getTotalDuration(vid_duration_converted));

    //checking if nextPageToken exists and count<limit
    if (playlistContent.nextPageToken !== undefined && count < limit) {
      nextPageToken = playlistContent.nextPageToken;
    } else {
      break;
    }
  }

  const URL3 = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistID}&key=${apiKey}&&fields=items/snippet/title,items/snippet/thumbnails/medium/url,items/snippet/channelTitle`;

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
    res.send(JSON.stringify(data));
    return;
  }

  const finalReponse = getTotalDuration(final_vid_dur);

  //adding some props to playlist_metadata object
  playlist_metaData.items[0].snippet.ok = true;
  playlist_metaData.items[0].snippet.count = count;
  playlist_metaData.items[0].snippet.unavailable_vids = unavailable_vids;

  res.send(
    JSON.stringify({
      duration: finalReponse,
      metaData: playlist_metaData.items[0].snippet,
    })
  );
};
