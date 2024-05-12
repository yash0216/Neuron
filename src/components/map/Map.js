import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import mapboxgl from "mapbox-gl";
import portData from "../../Data/portData.json";
import "mapbox-gl/dist/mapbox-gl.css";
import TimePort from "../time_port/TimePort"; // Import the TimePort component
import tzlookup from "tz-lookup";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const Map = () => {
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/light-v10",
      center: [0, 0],
      zoom: 2,
      minZoom: 2,
    });

    // Add navigation control to the map
    map.addControl(new mapboxgl.NavigationControl());

    // Add markers for ports
    portData.forEach((port) => {
      const timezone = tzlookup(
        port.geo_location_latitude,
        port.geo_location_longitude
      );

      const popupContent = document.createElement("div");
      ReactDOM.render(
        <div>
          <h3>{port.port_name}</h3>
          <p>Timezone: {timezone}</p>
          <TimePort
            latitude={port.geo_location_latitude}
            longitude={port.geo_location_longitude}
          />
        </div>,
        popupContent
      );

      const popup = new mapboxgl.Popup().setDOMContent(popupContent);

      // Create a marker for the port
      new mapboxgl.Marker()
        .setLngLat([port.geo_location_longitude, port.geo_location_latitude])
        .setPopup(popup)
        .addTo(map);
    });

    // Update map style based on time of day
    const updateMapStyle = () => {
      const currentHour = new Date().getHours();
      if (currentHour >= 6 && currentHour < 18) {
        map.setStyle("mapbox://styles/mapbox/navigation-day-v1");
      } else {
        map.setStyle("mapbox://styles/mapbox/navigation-night-v1");
      }
    };

    // Call updateMapStyle initially
    updateMapStyle();

    // Update map style every minute
    const intervalId = setInterval(updateMapStyle, 60000);

    // Cleanup function
    return () => {
      clearInterval(intervalId);
      map.remove();
    };
  }, []);

  return (
    <div
      id="map"
      style={{
        width: "100%",
        height: "100vh",
      }}
    />
  );
};

export default Map;
