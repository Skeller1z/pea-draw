import L, { LatLngBoundsLiteral } from "leaflet";
import React, { useState, useEffect, useRef } from "react";
import { FeatureGroup, ImageOverlay, MapContainer, TileLayer } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import { v4 as uuidv4 } from "uuid";
import { conformToRightHandRule } from "./Leaflet/ConvertRightHand";

const bounds: LatLngBoundsLiteral = [
  [0, 0],
  [4000, 300],
];

const Main2 = () => {
  const [mapCenter, setMapCenter] = useState<[number, number]>([65, 150]);
  const mapRef = useRef<any>(null);
  const [geoJsonData, setGeoJsonData] = useState([]);
  const initialDraftData = localStorage.getItem("draftPolygons");
  const [draftPolygons, setDraftPolygons] = useState<any[]>(
    initialDraftData ? JSON.parse(initialDraftData) : []
  );
  const [imageOverlayUrl, setImageOverlayUrl] = useState("https://bsv-th-authorities.com/impage_pro/รายคณะ.jpg");
  
  const exportDrafts = () => {
    if (draftPolygons.length === 0){
      console.warn('No data to save.');
      return;
    }
  
    const fileName = prompt('Please enter file name', 'polygon_drafts.json');
    if (fileName === null) {
      return;
    }

    const geoJSONData = {
      type: 'FeatureCollection',
      features: draftPolygons,
      imageOverlayUrl: imageOverlayUrl,
    };
    const geoJSONString = JSON.stringify(geoJSONData, null, 2);
    const blob = new Blob([geoJSONString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.endsWith('.json') ? fileName : fileName + '.json';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const [layerIdMap, setLayerIdMap] = useState({});

  const handleCreated = (e: any) => {
    const id = uuidv4();
    const { layerType, layer } = e;
    if (layerType === "polygon") {
      const geoJson = layer.toGeoJSON();
      geoJson.properties = { id, name: "" };
      setGeoJsonData((prevDrafts: any[]) => [...prevDrafts, geoJson]);
      setDraftPolygons((prevDrafts: any[]) => [...prevDrafts, geoJson]);
      const newLayerIdMap = { ...layerIdMap };
      newLayerIdMap[layer._leaflet_id] = id;
      setLayerIdMap(newLayerIdMap);
    }
  };

  // const handleEdited = (e: any) => {
  //   const layers = e.layers;
  //   layers.eachLayer((layer: any) => {
  //     const id = layerIdMap[layer._leaflet_id];
  //     const updatedGeoJson = layer.toGeoJSON();
  //     updatedGeoJson.properties = { ...updatedGeoJson.properties, id };
  //     const updatedDraftPolygons = draftPolygons.map((draft: any) =>
  //       draft.properties.id === id ? updatedGeoJson : draft
  //     );
  //     setDraftPolygons(updatedDraftPolygons);
  //   });
  // };


  const handleEdited = (e: any) => {
    const editedLayers = e.layers;
    editedLayers.eachLayer((layer: any) => {
        const layerId = layer[layer._leaflet_id];
        console.log(layerId)
        if (layerIdMap[layerId]) {
          const id = layerIdMap[layerId];
          const geoJson = layer.toGeoJSON();
          geoJson.properties = { id, name: "" };
          console.log(`Edited polygon ID: ${id}`);
          setDraftPolygons((prevDrafts: any[]) => {
            const index = prevDrafts.findIndex((draft) => draft.properties.id === id);
            if (index !== -1) {
              prevDrafts[index] = geoJson;
              return [...prevDrafts];
            }
            return prevDrafts;
          });
        }
     
    });
  };
  
  


  useEffect(() => {
    console.log(geoJsonData);
    console.log("draftPolygons",draftPolygons);
  }, [geoJsonData]);

  return (
    <>
     <button onClick={exportDrafts}>Export Drafts</button>
     <MapContainer ref={mapRef} center={[65, 150]} zoom={4}>
     <ImageOverlay bounds={bounds} url={imageOverlayUrl} />
      <FeatureGroup>
        <EditControl
          position="topright"
          onCreated={handleCreated}
          onEdited={handleEdited}
          draw={{
            rectangle: false,
          }}
        />
      </FeatureGroup>
    </MapContainer>
    </>
    
  );
};

export default Main2;
