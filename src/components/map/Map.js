import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import portData from "../../Data/portData.json";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const Map = () => {
  const mapContainer = useRef(null);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [0, 0],
      zoom: 2,
      minZoom: 2,
    });

    // Add navigation control to the map
    map.addControl(new mapboxgl.NavigationControl());

    // Add markers for ports
    portData.forEach((port) => {
      new mapboxgl.Marker()
        .setLngLat([port.geo_location_longitude, port.geo_location_latitude])
        .addTo(map)
        .setPopup(new mapboxgl.Popup().setHTML(`<h3>${port.port_name}</h3>`));
    });

    // Add marker for the center of the map
    const centerMarker = new mapboxgl.Marker({
      color: "#FF0000",
    })
      .setLngLat([0, 0])
      .addTo(map);

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div
      ref={mapContainer}
      style={{
        width: "100%",
        height: "100vh",
      }}
    />
  );
};

export default Map;
