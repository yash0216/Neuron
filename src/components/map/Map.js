import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import mapboxgl from "mapbox-gl";
import portData from "../../Data/portData.json";
import "mapbox-gl/dist/mapbox-gl.css";
import "./Map.css"; // Import the CSS file for styling
import TimePort from "../time_port/TimePort"; // Import the TimePort component
import tzlookup from "tz-lookup";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const Map = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchedPort, setSearchedPort] = useState(null);
  const [map, setMap] = useState(null); // Define map variable

  useEffect(() => {
    const mapInstance = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/light-v10",
      center: [0, 0],
      zoom: 2,
      minZoom: 2,
    });

    mapInstance.addControl(new mapboxgl.NavigationControl());
    mapInstance.addControl(new mapboxgl.FullscreenControl());
    mapInstance.addControl(new mapboxgl.GeolocateControl());

    setMap(mapInstance); // Set map instance to state

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
        .addTo(mapInstance);
    });
    const updateMapStyle = () => {
      const currentHour = new Date().getHours();
      if (currentHour >= 6 && currentHour < 18) {
        mapInstance.setStyle("mapbox://styles/mapbox/navigation-day-v1");
      } else {
        mapInstance.setStyle("mapbox://styles/mapbox/navigation-night-v1");
      }
    };

    // Call updateMapStyle initially
    updateMapStyle();

    // Update map style every minute
    const intervalId = setInterval(updateMapStyle, 60000);

    // Cleanup function
    return () => {
      clearInterval(intervalId);
      mapInstance.remove();
    };
  }, []);

  // Function to handle search
  const handleSearch = () => {
    // Create a regular expression from the search query
    const regex = new RegExp(searchQuery, "i");

    // Filter portData based on the search query
    const filteredPorts = portData.filter((port) => regex.test(port.port_name));

    // If a port is found, set it as the searched port
    if (filteredPorts.length > 0) {
      const searchedPort = filteredPorts[0];

      // Create a popup for the searched port
      const popupContent = document.createElement("div");
      const timezone = tzlookup(
        searchedPort.geo_location_latitude,
        searchedPort.geo_location_longitude
      );
      ReactDOM.render(
        <div>
          <h3>{searchedPort.port_name}</h3>
          <p>Timezone: {timezone}</p>
          <TimePort
            latitude={searchedPort.geo_location_latitude}
            longitude={searchedPort.geo_location_longitude}
          />
          {/* Add more information about the port as needed */}
        </div>,
        popupContent
      );

      const popup = new mapboxgl.Popup().setDOMContent(popupContent);

      // Set the popup at the searched port's coordinates
      new mapboxgl.Marker()
        .setLngLat([
          searchedPort.geo_location_longitude,
          searchedPort.geo_location_latitude,
        ])
        .setPopup(popup)
        .addTo(map);

      // Fly to the searched port's location
      map.flyTo({
        center: [
          searchedPort.geo_location_longitude,
          searchedPort.geo_location_latitude,
        ],
        zoom: 10,
      });
    } else {
      // If no port is found, display a message or handle it as per your requirement
      console.log("No port found with that name");
    }
  };

  return (
    <div>
      <div className="welcome-message">
        <h1>Welcome to Ocean's Eye</h1>
      </div>
      <div className="search-bar">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search port location..."
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      <div id="map" className="map-container" />
      {searchedPort && (
        <div className="marker-info">
          <h3>Port: {searchedPort.port_name}</h3>
          <p>Location: {searchedPort.location}</p>
          {/* Add more information about the port as needed */}
        </div>
      )}
    </div>
  );
};

export default Map;
