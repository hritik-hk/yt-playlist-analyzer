 // function to extracting duration in number format
function getTimeComponents(duration) {
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

  const getTotalDuration = (durations) => {
  
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


  


  module.exports={getTimeComponents, getTotalDuration, formatDuration}


  /*

  test-cases

"P4DT4H1S"
"P7DT7S"
"P1DT1S"
"P1DT1H1S"
"PT3H7M30S"
P1Y4M3W2DT10H31M3S

*/


