import React, { useState, ChangeEvent, useCallback, useRef, useEffect } from "react";
import {
  MapContainer,
  FeatureGroup,
  ImageOverlay,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import { GeoJSON } from "react-leaflet";
import { LatLngBoundsLiteral } from "leaflet";
import { conformToRightHandRule } from "./Leaflet/ConvertRightHand";
import { v4 as uuidv4 } from "uuid";

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

const bounds: LatLngBoundsLiteral = [
  [0, 0],
  [4000, 300],
];


const Main2 = () => {
  const [deletedPolygons, setDeletedPolygons] = useState<any[]>([]);
  const [state, setState] = useState<State>(initialState); // Use a single state object
  const [adminMode, setAdminMode] = useState(true);
  const initialDraftData = localStorage.getItem("draftPolygons");
  const [mapCenter, setMapCenter] = useState<[number, number]>([65, 150]);
  const [mapZoom, setMapZoom] = useState<number>(4);
  const mapRef = useRef<any>(null);
  const [imageOverlayUrl, setImageOverlayUrl] = useState("https://bsv-th-authorities.com/impage_pro/รายคณะ.jpg");
  const [draftPolygons, setDraftPolygons] = useState<any[]>(
    initialDraftData ? JSON.parse(initialDraftData) : []
  );
  const [geoJson, setGeoJson] = useState<any>(null);
  const [editedLayers, setEditedLayers] = useState<any[]>([]);
  const [allPolygons, setAllPolygons] = useState<any[]>([]);
  
  const exportDrafts = () => {
    if (draftPolygons.length === 0 && editedLayers.length === 0) {
      console.warn('No data to save.');
      return;
    }
  
    const fileName = prompt('Please enter file name', 'polygon_drafts.json');
    if (fileName === null) {
      return;
    }
  
    const allFeatures = [...draftPolygons, ...editedLayers];
    const geoJSONData = {
      type: 'FeatureCollection',
      features: allFeatures,
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
  
const onCreated = (e: any) => {
  const type = e.layerType;
  const layer = e.layer;
  const geoJSON = layer.toGeoJSON();
  const id = uuidv4(); // สร้าง UUIDv4 สำหรับ polygon ใหม่
  const conformingGeoJSON = { ...conformToRightHandRule(geoJSON), properties: { id: id, uuid: id } };
  if (type === "marker") {
    // ...
  } else if (type === "polyline" || type === "polygon") {
    setState((prevState) => ({
      ...prevState,
      createdLayer: layer,
    }));
    setDraftPolygons((prevDrafts) => [...prevDrafts, conformingGeoJSON]);
    setAllPolygons((prevPolygons) => [...prevPolygons, conformingGeoJSON]);
    setGeoJson(conformingGeoJSON);
  } else {
    // ...
  }
};

const updateDraftsWithEditedLayers = (editedLayers: any[]) => {
  const updatedDrafts = draftPolygons.map((draft) => {
    const found = editedLayers.find((edited) => edited.feature.properties.id === draft.properties.id);
    return found ? found.feature : draft;
  });
  setDraftPolygons(updatedDrafts);
};

const onEdited = (e: any) => {
  const layers = e.layers;
  const editedLayersArray: any[] = [];
  layers.eachLayer((layer: any) => {
    const geoJSON = layer.toGeoJSON();
    const conformingGeoJSON = conformToRightHandRule(geoJSON);
    const layerId = conformingGeoJSON.properties.id;
    editedLayersArray.push(conformingGeoJSON);

    // Update draftPolygons only if the edited layer matches a draft
    const draftIndex = draftPolygons.findIndex(draft => draft.properties.id === layerId);
    if (draftIndex !== -1) {
      const updatedDrafts = [...draftPolygons];
      updatedDrafts[draftIndex] = conformingGeoJSON;
      setDraftPolygons(updatedDrafts);
    }
  });

  setEditedLayers(editedLayersArray);
};


const onDeleted = (e: any) => {
  const layers = e.layers;
  const deletedLayersArray: any[] = [];
  layers.eachLayer((layer: any) => {
    const geoJSON = layer.toGeoJSON();
    const conformingGeoJSON = conformToRightHandRule(geoJSON);
    deletedLayersArray.push({ feature: conformingGeoJSON, layer: layer });
  });
  setDeletedPolygons(deletedLayersArray);
};
  
  useEffect(() => {
    console.log('Deleted polygons:', deletedPolygons);
    console.log('Remaining polygons:', draftPolygons);
  }, [deletedPolygons, draftPolygons]);
  
  return (
    <div className="w-full">
      <button onClick={exportDrafts}>Export Drafts</button>
        <MapContainer ref={mapRef} center={mapCenter} zoom={mapZoom} style={{ zIndex: 1 }} className="w-full h-screen">
          <ImageOverlay bounds={bounds} url={imageOverlayUrl} />
          <FeatureGroup>
            {adminMode ? (
              <EditControl
                position="topright"
                onCreated={onCreated}
                onEdited={onEdited}
                 onDeleted={onDeleted}
                draw={{
                  rectangle: false,
                }}
              />
            ) : null}
          </FeatureGroup>
        </MapContainer>
      </div>
  )
}

export default Main2