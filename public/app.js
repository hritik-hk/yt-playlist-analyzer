
const form=document.getElementById("url-form");
const loader=document.getElementsByClassName("loader")[0];
const content=document.getElementsByClassName("content")[0];
const errorDiv=document.getElementsByClassName("errorDiv")[0];

form.addEventListener("submit", getPlaylistData);


//main function where all api calls is happening 
async function getPlaylistData(e){
    e.preventDefault();

    content.classList.add("hide");
    loader.classList.remove("hide");
    errorDiv.classList.add("hide");

    const link={url : document.getElementById("url").value};

    let final_vid_dur=""; // to store final duration obj at 1x speed

   try{
    const response=await fetch('/get-length',{
      method: "POST",
      headers: {
        'COntent-Type':'application/json'
      },
      body: JSON.stringify(link)
    })

    final_vid_dur= await response.json();    
   }
   catch(err){
    console.log(err)
    errorDiv.innerHTML=`Some error occurred... Pls Try again!`;
      loader.classList.add("hide");
      errorDiv.classList.remove("hide");
      return;
   }

   if(!final_vid_dur.ok){
       errorDiv.innerHTML=final_vid_dur.error;
      loader.classList.add("hide");
      errorDiv.classList.remove("hide");
      return;
   }

   const count=final_vid_dur.count;
   const unavailable_vids=final_vid_dur.unavailable_vids;
    
//final duration object i.e duration values at 1x 
 const final_dur_obj_1x=final_vid_dur;
formatDuration(final_dur_obj_1x);

//declaring variables for 1.25x, 1.5x and 2x
const At_125x={...final_dur_obj_1x};
const At_15x={...final_dur_obj_1x};
const At_175x={...final_dur_obj_1x};
const At_2x={...final_dur_obj_1x};


divideDurationByX(At_125x,1.25)
divideDurationByX(At_15x,1.5)
divideDurationByX(At_175x,1.75)
divideDurationByX(At_2x,2)



formatDuration(At_125x)
formatDuration(At_15x)
formatDuration(At_175x)
formatDuration(At_2x)



content.innerHTML=`
<p>Total No. of Videos: ${count}</p>
<p>Total No. of Available Videos: ${count-unavailable_vids}</p>
<p>Total No. of Unvailable Videos: ${unavailable_vids}</p>
<p>Total length of playlist : ${formatOutput(final_dur_obj_1x)}</p>
<p>At 1.25x : ${formatOutput(At_125x)}</p>
<p>At 1.50x : ${formatOutput(At_15x)}</p>
<p>At 1.75x : ${formatOutput(At_175x)}</p>
<p>At 2.00x : ${formatOutput(At_2x)}</p>
`;

loader.classList.add("hide");
content.classList.remove("hide");


}

function getPlaylistID(link){
   // Extract the playlist ID from the link
  let playlistId = '';
  if (link.includes('list=')) {
    const arr=link.split('list=');
    playlistId = arr[1];
   const ampersandIndex = playlistId.indexOf('&');

    if (ampersandIndex !== -1) {
      playlistId = playlistId.substring(0, ampersandIndex);
    }
  }
  else {
    // The link doesn't contain a playlist ID
    console.error('Invalid playlist link:', link);
    //also display it to the user that it doesn't contain "list=" parameter or it's invalid playlist link
  }
  
  return playlistId;
}


function divideDurationByX(duration,x){
  //looping through all props and dividing by x
  for (const prop in duration) {
    duration[prop]=duration[prop]/x;
   }
   
 
  if(duration.days!=0){
    duration.hours+=(duration.days-Math.floor(duration.days))*24;
    duration.days=Math.floor(duration.days);

  }
  if(duration.hours!=0){
    duration.minutes+=(duration.hours-Math.floor(duration.hours))*60;
    duration.hours=Math.floor(duration.hours);
  }
  if(duration.minutes!=0){
    duration.seconds+=(duration.minutes-Math.floor(duration.minutes))*60;
    duration.minutes=Math.floor(duration.minutes);
  }

  duration.seconds=Math.round(duration.seconds)

}

//for formating final duration object
 const formatDuration=(result)=>{
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

    if(result.weeks!==0 || result.months!==0 || result.years!==0){
      result.days+=(result.weeks*7)+(result.months*30)+(result.years*365);
    }

}



function formatOutput(duration){

  const days= duration.days>0? `${duration.days} day${duration.days>1?'s':''}`: ""
  const hrs= duration.hours>0? `${duration.hours} hour${duration.hours>1?'s':''}`: "";
  const min= duration.minutes>0? `${duration.minutes} minute${duration.minutes>1?'s':''}` : ""
  const sec=duration.seconds? `${duration.seconds} second${duration.seconds>1?'s':''}` : ""

  const result=`${days===""?"":days+', '}${hrs===""?"": hrs+', '}${min===""?"":min+', '}${sec}`

  return result;

}



