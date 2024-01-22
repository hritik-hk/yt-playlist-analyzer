 // function to extracting duration in number format
 exports.getTimeComponents= (duration) =>{
    const timeRegex = /^P(\d+Y)?(\d+M)?(\d+W)?(\d+D)?T?(\d+H)?(\d+M)?(\d+S)?$/;

    const match = timeRegex.exec(duration);

    if (!match) {
      return null;
    }
    const [, years, months, weeks, days, hours, minutes, seconds] = match;
    return {
      years: parseInt(years) || 0,
      months: parseInt(months) || 0,
      weeks: parseInt(weeks) || 0,
      days: parseInt(days) || 0,
      hours: parseInt(hours) || 0,
      minutes: parseInt(minutes) || 0,
      seconds: parseInt(seconds) || 0,
    };
  }


  //add ISO 8601 converted duration objects
/*
duration =>an containing objects, each representing a duration in 
years, months, weeks, days, hours, minutes, and seconds properties. 
*/
exports.getTotalDuration = (durations) => {
  
 return durations.reduce((acc, curr) => {
    return {
      years: acc.years + curr.years,
      months: acc.months + curr.months,
      weeks: acc.weeks + curr.weeks,
      days: acc.days + curr.days,
      hours: acc.hours + curr.hours,
      minutes: acc.minutes + curr.minutes,
      seconds: acc.seconds + curr.seconds
    }
  
  });

}

//for formating final duration object
exports.formatDuration=(result)=>{
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
