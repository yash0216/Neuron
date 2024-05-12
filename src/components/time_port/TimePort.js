import React, { useState, useEffect } from "react";
import tzlookup from "tz-lookup";

const TimePort = ({ latitude, longitude }) => {
  const [localTime, setLocalTime] = useState("");

  useEffect(() => {
    const timezone = tzlookup(latitude, longitude);
    const options = {
      timeZone: timezone,
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    };
    const intervalId = setInterval(() => {
      const time = new Date().toLocaleString("en-US", options);
      setLocalTime(time);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [latitude, longitude]);

  return <p>Local Time: {localTime}</p>;
};

export default TimePort;
