const form = document.getElementById("url-form");
const loader = document.getElementsByClassName("loader")[0];
const content = document.getElementsByClassName("content")[0];
const errorDiv = document.getElementsByClassName("errorDiv")[0];

form.addEventListener("submit", getPlaylistData);

async function getPlaylistData(e) {
  e.preventDefault();

  content.classList.add("hide");
  loader.classList.remove("hide");
  errorDiv.classList.add("hide");

  const link = { url: document.getElementById("url").value };

  let playlist_data;

  try {
    const response = await fetch("/api/playlist/info", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(link),
    });

    playlist_data = await response.json();

    console.log(playlist_data);
  } catch (err) {
    console.log(err);
    errorDiv.innerHTML = `Some error occurred... Pls Try again!`;
    loader.classList.add("hide");
    errorDiv.classList.remove("hide");
    return;
  }

  if (!playlist_data.ok) {
    errorDiv.innerHTML = playlist_data.error;
    loader.classList.add("hide");
    errorDiv.classList.remove("hide");
    return;
  }

  const count = playlist_data.metaData.count;
  const unavailable_vids = playlist_data.metaData.unavailable_vids;
  const thumbnailURL = playlist_data.metaData.thumbnails.medium.url;
  const title = playlist_data.metaData.title;
  const createdBy = playlist_data.metaData.channelTitle;

  //total playlist length in seconds
  const playlist_length = playlist_data.duration;

  content.innerHTML = `
<div id="metaData">
<div><img src=${thumbnailURL} alt="Thumbnail" id="thumbnail"></div>
<div id="title">
    <h3><span>${title}</span> - <span>${createdBy}</span></h3>
</div>
</div>
<div>
<p>Total No. of Videos: ${count}</p>
<p>Total No. of Available Videos: ${count - unavailable_vids}</p>
<p>Total No. of Unvailable Videos: ${unavailable_vids}</p>
<p>Total length of playlist : ${formatOutput(
    formatDuration(playlist_length, 1)
  )}</p>
<p>At 1.25x : ${formatOutput(formatDuration(playlist_length, 1.25))}</p>
<p>At 1.50x : ${formatOutput(formatDuration(playlist_length, 1.5))}</p>
<p>At 1.75x : ${formatOutput(formatDuration(playlist_length, 1.75))}</p>
<p>At 2.00x : ${formatOutput(formatDuration(playlist_length, 2))}</p>
</div>
`;

  loader.classList.add("hide");
  content.classList.remove("hide");
  document.getElementById("url").value="";
}

const formatDuration = (duration, speed) => {
  duration = Math.ceil(duration / speed);
  let days, hours, minutes, seconds, remainder;
  days = Math.floor(duration / (60 * 60 * 24));
  remainder = duration % (60 * 60 * 24);

  if (remainder) {
    hours = Math.floor(remainder / (60 * 60));
    remainder = remainder % (60 * 60);
  }

  if (remainder) {
    minutes = Math.floor(remainder / 60);
    remainder = remainder % 60;
  }

  if (remainder) {
    seconds = remainder;
  }

  return { days: days, hours: hours, minutes: minutes, seconds: seconds };
};

function formatOutput(duration) {
  const days =
    duration.days > 0
      ? `${duration.days} day${duration.days > 1 ? "s" : ""}`
      : "";
  const hrs =
    duration.hours > 0
      ? `${duration.hours} hour${duration.hours > 1 ? "s" : ""}`
      : "";
  const min =
    duration.minutes > 0
      ? `${duration.minutes} minute${duration.minutes > 1 ? "s" : ""}`
      : "";
  const sec = duration.seconds
    ? `${duration.seconds} second${duration.seconds > 1 ? "s" : ""}`
    : "";

  const result = `${days === "" ? "" : days + ", "}${
    hrs === "" ? "" : hrs + ", "
  }${min === "" ? "" : min + ", "}${sec}`;

  return result;
}
