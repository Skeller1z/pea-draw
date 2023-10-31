import React, { useRef, useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  FeatureGroup,
  useMap,
  ImageOverlay,
} from "react-leaflet";
import L, { LatLngBoundsLiteral } from "leaflet";
import { EditControl } from "react-leaflet-draw";
import { data } from "./Leaflet/data/data";

const bounds: LatLngBoundsLiteral = [
  [0, 0],
  [4000, 300],
];

type State = {
  adminMode: boolean;
  imageUrl: string | null;
  polygonName: string;
  showModal: boolean;
  infoModal: boolean;
  createdLayer: any | null;
  details: string;
  imageFile: File | null;
  showPopup: boolean;
};

const initialState: State = {
  adminMode: true,
  imageUrl: null,
  polygonName: "",
  showModal: false,
  infoModal: false,
  createdLayer: null,
  details: "",
  imageFile: null,
  showPopup: false
};

const Main = () => {
  const [geoJsonData, setGeoJsonData] = useState(data); // Use useState to manage GeoJSON data
 
  const [mapZoom, setMapZoom] = useState<number>(4);
  const [mapCenter, setMapCenter] = useState<[number, number]>([65, 150]);
  const mapRef = useRef<any>(null);
  const [imageOverlayUrl, setImageOverlayUrl] = useState(
    "https://bsv-th-authorities.com/impage_pro/รายคณะ.jpg"
  );
  const [state, setState] = useState<State>(initialState);
  const [layers, setLayers] = useState(null);
  const initialDraftData = localStorage.getItem("draftPolygons");
  const parsedInitialData = initialDraftData ? JSON.parse(initialDraftData) : [];
  const [draftPolygons, setDraftPolygons] = useState<any[]>(parsedInitialData);
  const drawControlRef = useRef(null);


  const handleDelete = (e) => {
    const { layers } = e;
    const updatedData = { ...geoJsonData }; // Create a copy of the geoJsonData
    layers.eachLayer((layer) => {
      const { feature } = layer;
      updatedData.features = updatedData.features.filter(
        (f) => f.properties.id !== feature.properties.id
      );
      const deletedFeature = geoJsonData.features.find(
        (f) => f.properties.id === feature.properties.id
      ); // Get the deleted feature
      setGeoJsonData({ ...updatedData }); // Update the state with the modified data
      console.log("Deleted Feature: ", deletedFeature);
      console.log(updatedData); // Log the updated data directly
    });
  };

const exportDrafts = () => {
    if (geoJsonData.features.length === 0) {
        console.warn("No data to save.");
        return;
    }

    const fileName = prompt("Please enter file name", "polygon_drafts.json");
    if (fileName === null) {
        return;
    }

    const geoJSONData = {
        type: "FeatureCollection",
        features: [...geoJsonData.features],
        imageOverlayUrl: imageOverlayUrl,
    };
    const geoJSONString = JSON.stringify(geoJSONData, null, 2);
    const blob = new Blob([geoJSONString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName.endsWith(".json") ? fileName : fileName + ".json";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
};

const handleImport = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = JSON.parse(e.target.result as string);
      setGeoJsonData(content); // ตั้งค่าข้อมูล GeoJSON ที่ import เข้ามา
      console.log("Success", content);
    } catch (error) {
      console.error("Error parsing JSON file", error);
    }
  };
  reader.readAsText(file);
};

const onEdited = (e) => {
  // Do whatever else you need to. (save to db, etc)
  console.log("Edited!", e);
};

  return (
    <>  
    <button className="" onClick={exportDrafts}>Export Drafts</button>
    <MapContainer
      ref={mapRef}
      center={mapCenter}
      zoom={mapZoom}
      style={{ zIndex: 1 }}
      className="w-full h-screen"
    >
      <ImageOverlay
        bounds={bounds}
        url={imageOverlayUrl} // Use URL from selectedData
      />
      <FeatureGroup ref={drawControlRef}>
        <EditControl
          position="topright"
          onDeleted={handleDelete}
          draw={{
            rectangle: false,
          }}
        />
        
        <GeoJSON data={geoJsonData} /> {/* Render the updated GeoJSON data */}
      </FeatureGroup>
    </MapContainer>
    
    </>
  );
};

export default Main;