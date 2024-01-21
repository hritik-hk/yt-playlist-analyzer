const content = document.querySelector("#playlist-info");
const loader = document.querySelector(".loader-container");

const getCurrentTabUrl = async () => {
  const tab = await chrome.tabs.query({ currentWindow: true, active: true });
  return tab[0].url;
};

async function getPlaylistData() {
  const link = await getCurrentTabUrl();
  console.log(link);
  await fetch("https://youtube-playlist-analyzer.vercel.app/get-length", {
    method: "POST",
    body: JSON.stringify({ url: link }),
    headers: { "content-type": "application/json" },
  })
    .then((response) => response.json())
    .then((data) => {
        updateUI(data);
    });
}

getPlaylistData();

const updateUI = (final_vid_dur) => {
  const count = final_vid_dur.metaData.count;
  const unavailable_vids = final_vid_dur.metaData.unavailable_vids;
  const title = final_vid_dur.metaData.title;
  const createdBy = final_vid_dur.metaData.channelTitle;

  //final duration object i.e duration values at 1x
  const final_dur_obj_1x = { ...final_vid_dur.duration };

  formatDuration(final_dur_obj_1x);

  //declaring variables for 1.25x, 1.5x and 2x
  const At_125x = { ...final_dur_obj_1x };
  const At_15x = { ...final_dur_obj_1x };
  const At_175x = { ...final_dur_obj_1x };
  const At_2x = { ...final_dur_obj_1x };

  divideDurationByX(At_125x, 1.25);
  divideDurationByX(At_15x, 1.5);
  divideDurationByX(At_175x, 1.75);
  divideDurationByX(At_2x, 2);

  formatDuration(At_125x);
  formatDuration(At_15x);
  formatDuration(At_175x);
  formatDuration(At_2x);


  loader.classList.add("hide");


  content.innerHTML = `
 <div id="metaData">
 <div id="title">
     <h3><span>${title}</span> - <span>${createdBy}</span></h3>
 </div>
 </div>
 <div>
 <p>Total No. of Videos: ${count}</p>
 <p>Total No. of Available Videos: ${count - unavailable_vids}</p>
 <p>Total No. of Unvailable Videos: ${unavailable_vids}</p>
 <p>Total length of playlist : ${formatOutput(final_dur_obj_1x)}</p>
 <p>At 1.25x : ${formatOutput(At_125x)}</p>
 <p>At 1.50x : ${formatOutput(At_15x)}</p>
 <p>At 1.75x : ${formatOutput(At_175x)}</p>
 <p>At 2.00x : ${formatOutput(At_2x)}</p>
 </div>
 `;
};

function divideDurationByX(duration, x) {
  //looping through all props and dividing by x
  for (const prop in duration) {
    duration[prop] = duration[prop] / x;
  }

  if (duration.days != 0) {
    duration.hours += (duration.days - Math.floor(duration.days)) * 24;
    duration.days = Math.floor(duration.days);
  }
  if (duration.hours != 0) {
    duration.minutes += (duration.hours - Math.floor(duration.hours)) * 60;
    duration.hours = Math.floor(duration.hours);
  }
  if (duration.minutes != 0) {
    duration.seconds += (duration.minutes - Math.floor(duration.minutes)) * 60;
    duration.minutes = Math.floor(duration.minutes);
  }

  duration.seconds = Math.round(duration.seconds);
}

//for formating final duration object
const formatDuration = (result) => {
  if (result.seconds >= 60) {
    result.minutes += Math.floor(result.seconds / 60);
    result.seconds %= 60;
  }
  if (result.minutes >= 60) {
    result.hours += Math.floor(result.minutes / 60);
    result.minutes %= 60;
  }
  if (result.hours >= 24) {
    result.days += Math.floor(result.hours / 24);
    result.hours %= 24;
  }

  if (result.weeks !== 0 || result.months !== 0 || result.years !== 0) {
    result.days += result.weeks * 7 + result.months * 30 + result.years * 365;
  }
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
