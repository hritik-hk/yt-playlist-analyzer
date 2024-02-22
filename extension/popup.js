const content = document.querySelector("#playlist-info");
const loader = document.querySelector(".loader-container");

const getCurrentTabUrl = async () => {
  const tab = await chrome.tabs.query({ currentWindow: true, active: true });
  return tab[0].url;
};

async function getPlaylistData() {
  const link = await getCurrentTabUrl();
  console.log(link);
  await fetch(
    "https://youtube-playlist-analyzer.vercel.app/api/playlist/info",
    {
      method: "POST",
      body: JSON.stringify({ url: link }),
      headers: { "content-type": "application/json" },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      if (!data.ok) {
        content.innerHTML = data.error;
        loader.classList.add("hide");
      } else {
        updateUI(data);
      }
    })
    .catch((err) => {
      content.innerHTML = `Some error occurred... Pls Try again!`;
      loader.classList.add("hide");
    });
}

getPlaylistData();

const updateUI = (playlist_data) => {
  const count = playlist_data.metaData.count;
  const unavailable_vids = playlist_data.metaData.unavailable_vids;
  const title = playlist_data.metaData.title;
  const createdBy = playlist_data.metaData.channelTitle;

  //total playlist length in seconds
  const playlist_length = playlist_data.duration;

  //limit exceeded
  const limitedTo = playlist_data.limited;
  const limit = limitedTo !== 0 ? `No. of videos limited to first: ${limitedTo} videos` : "";

  loader.classList.add("hide");

  content.innerHTML = `
  <div id="metaData">
  <div id="title">
      <h3><span>${title}</span> - <span>${createdBy}</span></h3>
  </div>
  </div>
  <div>
  <p style="color:red;">${limit}</p>
  <p><b>Total No. of Videos:</b> ${count}</p>
  <p><b>Total No. of Available Videos:</b> ${count - unavailable_vids}</p>
  <p><b>Total No. of Unvailable Videos:</b> ${unavailable_vids}</p>
  <p><b>Total length of playlist :</b> ${formatOutput(
    formatDuration(playlist_length, 1)
  )}</p>
  <p><b>At 1.25x :</b> ${formatOutput(
    formatDuration(playlist_length, 1.25)
  )}</p>
  <p><b>At 1.50x :</b> ${formatOutput(formatDuration(playlist_length, 1.5))}</p>
  <p><b>At 1.75x :</b> ${formatOutput(
    formatDuration(playlist_length, 1.75)
  )}</p>
  <p><b>At 2.00x :</b> ${formatOutput(formatDuration(playlist_length, 2))}</p>
  </div>
  <div>Made with ❤️ by <a href="https://github.com/hritik-hk" target="_blank">HRITIK</a></div>
  `;
};

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
