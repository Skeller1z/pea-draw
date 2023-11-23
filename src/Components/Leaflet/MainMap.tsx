import { LatLngBoundsLiteral } from "leaflet";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { FeatureGroup, ImageOverlay, MapContainer } from "react-leaflet";
import { GeoJSON } from "react-leaflet";
import Topbar from "../Topbar/Topbar";
import {
  faExpand,
  faEye,
  faFileExport,
  faMagnifyingGlass,
  faMap,
  faMaximize,
  faMinimize,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { EditControl } from "react-leaflet-draw";
import { conformToRightHandRule } from "./ConvertRightHand";
import { data } from "./data/data";
import { data3 } from "./data/data3";
import { getGeoJson } from "./data/TestFunc";
import L from "leaflet";
import PolygonDetailsModal from "./PolygonDetailsModal";
import SearchMap from "./SearchMap";
type State = {
  imageUrl: string | null;
  polygonName: string;
  showModal: boolean;
  infoModal: boolean;
  createdLayer: any | null;
  details: string;
  imageFile: File | null;
  showPopup: boolean;
  polygonID: number;
};

const initialState: State = {
  imageUrl: null,
  polygonName: "",
  showModal: false,
  infoModal: false,
  createdLayer: null,
  details: "",
  imageFile: null,
  showPopup: false,
  polygonID: null,
};

const bounds: LatLngBoundsLiteral = [
  [0, 0],
  [4000, 300],
];

const MainMap = () => {
  const [adminMode, setAdminMode] = useState(true);
  const initialDraftData = localStorage.getItem("draftPolygons");
  const [draftPolygons, setDraftPolygons] = useState<any[]>(
    initialDraftData ? JSON.parse(initialDraftData) : []
  );
  const [state, setState] = useState<State>(initialState);
  const [mapCenter, setMapCenter] = useState<[number, number]>([65, 150]);
  const [mapZoom, setMapZoom] = useState<number>(4);
  const [showSearch, setSearch] = useState<boolean>(false);
  const [isTopBarVisible, setIsTopBarVisible] = useState(true);
  const mapRef = useRef<any>(null);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [image, setImage] = useState<string | ArrayBuffer | null>("");
  const [imageOverlayUrl, setImageOverlayUrl] = useState(
    "https://bsv-th-authorities.com/impage_pro/รายคณะ.jpg"
  );
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [importedData, setImportedData] = useState<any[]>([]);
  const [geoJson, setGeoJson] = useState<any>(null);
  const [coordinates, setCoordinates] = useState<any[]>([]);
  const [selectedColor, setSelectedColor] = useState("#FF5733"); // Default color

  const featureGroupRef = useRef();

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      // ทำสิ่งที่คุณต้องการทำก่อนที่หน้าจะถูกรีเฟรช
      const message = "คุณแน่ใจหรือไม่ว่าต้องการออกหน้านี้?";
      event.returnValue = message; // Standard for most browsers
      return message; // For some older browsers
    };

    // เพิ่ม event listener เมื่อ component ถูก mount
    window.addEventListener('beforeunload', handleBeforeUnload);

    // ลบ event listener เมื่อ component ถูก unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  
  useEffect(() => {
    if (featureGroupRef.current) {
      onFeatureGroupReady(featureGroupRef.current);
    }
  }, []);

  const exportDrafts = () => {
    if (draftPolygons.length === 0) {
        console.warn('No data to save.');
        return;
    }

    const fileName = prompt("Please enter file name", "polygon_drafts.json");
    if (fileName === null) {
        return;
    }

    const geoJSONData = {
        type: "FeatureCollection",
        features: draftPolygons,
        imageOverlayUrl: imageOverlayUrl,
    };
    const geoJSONString = JSON.stringify(geoJSONData, null, 2);
    const blob = new Blob([geoJSONString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName.endsWith('.json') ? fileName : fileName + '.json';
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
};


  const savePolygonData = () => {
    geoJson.properties = {
      id: state.polygonID,
      name: state.polygonName,
      image: state.imageUrl || image,
      details: state.details,
      ...geoJson.properties,
      color: selectedColor,
    };
    setState((prevState) => ({ 
      ...prevState, 
      showModal: false ,
      id: "",
      polygonName: "",
      imageUrl: null,
      details: "",
    }));
    console.log(geoJson);
    if (state.polygonName && state.createdLayer) {
      const content = `
        <h3>${state.polygonName}</h3>
        <img src="${state.imageUrl || image}" alt="${
        state.polygonName
      }" width="100" />
        <p>${state.details || ""}</p>
      `;
      state.createdLayer.bindPopup(content).openPopup();
      state.createdLayer.setStyle({
        fillColor: selectedColor,
        color: selectedColor,
      });
      console.log(state.polygonName);
    } else {
    }
  };

  const onFeatureGroupReady = (reactFGref) => {
    // populate the leaflet FeatureGroup with the geoJson layers
    let leafletGeoJSON = new L.GeoJSON(data);
    let leafletFG = reactFGref.leafletElement;

    leafletGeoJSON.eachLayer((layer) => {
      leafletFG.addLayer(layer);
    });

    // store the ref for future access to content
    featureGroupRef.current = reactFGref;
  };

  // const onDeleted = (e) => {
  //   let numDeleted = 0;
  //   if (geoJsonData) {
  //     const updatedGeoJsonData = { ...geoJsonData };
  //     e.layers.eachLayer((layer) => {
  //       numDeleted += 1;
  //       const deletedFeature = layer.feature;
  //       const updatedFeatures = updatedGeoJsonData.features.filter(
  //         (feature) => feature !== deletedFeature
  //       );
  //       updatedGeoJsonData.features = updatedFeatures;
  //     });
  //     setGeoJsonData(updatedGeoJsonData);
  //     console.log(`onDeleted: removed ${numDeleted} layers`, e);
  //   } else {
  //     console.error("GeoJSON data is not defined.");
  //   }
  // };

  // const onEdited = (e) => {
  //   const layers = e.layers;
  //   if (geoJsonData) {
  //     const updatedGeoJsonData = { ...geoJsonData };
  //     layers.eachLayer((layer) => {
  //       if (layer && layer.toGeoJSON) {
  //         const editedFeature = layer.toGeoJSON();
  //         const index = updatedGeoJsonData.features.findIndex(
  //           (feature) => feature.properties.id === editedFeature.properties.id
  //         );
  //         if (index !== -1) {
  //           updatedGeoJsonData.features[index] = editedFeature;
  //         }
  //       }
  //     });
  //     setGeoJsonData(updatedGeoJsonData);
  //     console.log('onEdited:', e);
  //   } else {
  //     console.error('GeoJSON data is not defined.');
  //   }
  // };

  // const onEdited = (e) => {
  //   let numEdited = 0;
  //   e.layers.eachLayer((layer) => {
  //     numEdited += 1;
  //   });
  //   console.log(`_onEdited: edited ${numEdited} layers`, e);
  // };

  const importGeoJson = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const importedData = JSON.parse(e.target?.result as string);
          setImportedData(importedData.features || []);
          setGeoJsonData(importedData);
          setCoordinates(importedData.coordinates);
          console.log(importedData);
          setImageOverlayUrl(importedData.imageOverlayUrl);
          console.log("GeoJSON import successful!"); // Log success message
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      };
      reader.readAsText(file);
    }
  };

  const onCreated = (e: any) => {
    const type = e.layerType;
    const layer = e.layer;
    const geoJSON = layer.toGeoJSON();
    const conformingGeoJSON = conformToRightHandRule(geoJSON);
    if (type === "marker") {
      // ...
    } else if (type === "polyline" || type === "polygon") {
      setState((prevState) => ({
        ...prevState,
        showModal: true,
        createdLayer: layer,
      }));
      setDraftPolygons((prevDrafts) => [...prevDrafts, conformingGeoJSON]);
      setGeoJson(conformingGeoJSON);

      // Fit the map to the bounds of the newly created polygon
      const polygonBounds = layer.getBounds();
      const map = layer._map; // Get a reference to the map
      map.fitBounds(polygonBounds);

      // Set the map center and zoom to the fitted bounds
      setMapCenter(map.getCenter());
      setMapZoom(map.getZoom());

      layer.on("click", function () {
        // Your onClick logic here
        console.log("Polygon clicked");
      });
    } else {
      // ...
    }
  };

  const handleImageInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result;
        setImage(base64data);
        if (typeof base64data === "string") {
          console.log("Base64:", base64data); // Log the base64 data to the console
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSidebar = () => {
    setIsTopBarVisible(!isTopBarVisible);
  };

  const toggleTable = () => {
    console.log(showSearch);
    setSearch(!showSearch);
  };

  // <img src="${feature.properties.image || image}" alt="${
  //   feature.properties.name
  // }" class="mt-2 mb-4" width="100" />

  const renderGeoJSONOnEachFeature = (feature: any, layer: any) => {
    if (feature.properties) {
      const popupContent = `
      <div class="max-w-sm p-4">
      <h3 class="text-lg font-bold">${feature.properties.id}</h3>
        <h3 class="text-lg font-bold">${feature.properties.name}</h3>
        <p class="text-sm">${feature.properties.details || ""}</p>
      </div>`;
      layer.bindPopup(popupContent, { maxWidth: 400, className: "stylePopup" });

      layer.on("mouseover", function () {
        layer.setStyle({ fillOpacity: 0.2 }); // Change opacity or any other style
        layer.openPopup();
      });

      layer.on("mouseout", function () {
        layer.setStyle({ fillOpacity: 0 }); // Hide the polygon on mouseout
        layer.closePopup();
      });

      layer.on("click", function () {
        setState((prevState) => ({
          ...prevState,
          infoModal: true,
          createdLayer: layer,
        }));
        setSelectedFeature(feature);
        flyToFeature(feature);
      });
    }
  };

  const flyToFeature = (feature: any) => {
    if (feature && feature.geometry && feature.geometry.type === "Polygon") {
      const coordinates = feature.geometry.coordinates[0];
      if (coordinates.length > 0) {
        const sumLatLng = coordinates.reduce(
          (acc: [number, number], coord: [number, number]) => {
            return [acc[0] + coord[0], acc[1] + coord[1]];
          },
          [0, 0]
        );
        const avgLatLng = [
          sumLatLng[1] / coordinates.length,
          sumLatLng[0] / coordinates.length,
        ];
        const map = mapRef.current;
        if (map) {
          map.flyTo(avgLatLng, 6);
        }
      }
    }
  };

  const renderGeoJSONStyle = (feature: any) => {
    const defaultStyle = {
      fillColor: "none",
      fillOpacity: 0,
      color: "none",
      weight: 0,
    };

    if (feature && feature.properties && feature.properties.color) {
      return {
        // ...defaultStyle, // override defaults with properties if they exist
        fillColor: feature.properties.color,
        color: feature.properties.color,
      };
    }

    // return defaultStyle;
  };

  const SelectImageOverlay = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          // Here, reader.result will be the base64 string
          setImageOverlayUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex border">
      <div className="w-full fixed inset-x-0 top-0">
        <Topbar
          toggleTable={toggleTable}
          isTopBarVisible={isTopBarVisible}
          toggleSidebar={toggleSidebar}
          importGeoJson={importGeoJson}
        />

        <MapContainer
          ref={mapRef}
          center={mapCenter}
          zoom={mapZoom}
          style={{ zIndex: 1 }}
          className="w-full h-screen"
          zoomControl={false}
        >
          <ImageOverlay
            bounds={bounds}
            url={imageOverlayUrl} // ใช้ URL จาก selectedData
          />
          <FeatureGroup ref={featureGroupRef}>
            {adminMode ? (
              <EditControl
                position="topleft"
                onCreated={onCreated}
                draw={{
                  rectangle: false,
                  polyline: false,
                  circle: false,
                  circlemarker: false,
                  marker: false,
                  
                }}
              />
            ) : null}
            {geoJsonData && (
              <GeoJSON
                data={geoJsonData}
                style={renderGeoJSONStyle}
                onEachFeature={renderGeoJSONOnEachFeature}
              />
            )}
          </FeatureGroup>
        </MapContainer>
      </div>
      <SearchMap
        flyToFeature={flyToFeature}
        showSearch={showSearch}
        toggleTable={toggleTable}
        isTopBarVisible={isTopBarVisible}
        importedData={importedData}
      />
      
      <PolygonDetailsModal
        showModal={state.showModal}
        polygonID={state.polygonID}
        polygonName={state.polygonName}
        imageUrl={state.imageUrl}
        details={state.details}
        selectedColor={selectedColor}
        handleImageInputChange={handleImageInputChange}
        savePolygonData={savePolygonData}
        closeModal={() =>
          setState((prevState) => ({ ...prevState, showModal: false }))
        }
        setPolygonID={(polyid) =>
          setState((prevState) => ({ ...prevState, polygonID: polyid }))
        }
        setPolygonName={(name) =>
          setState((prevState) => ({ ...prevState, polygonName: name }))
        }
        setImageUrl={(url) =>
          setState((prevState) => ({ ...prevState, imageUrl: url }))
        }
        setDetails={(details) =>
          setState((prevState) => ({ ...prevState, details: details }))
        }
        setSelectedColor={(color) => setSelectedColor(color)}
      />

      <input
        id="geoJsonMapInput"
        type="file"
        accept="image/*"
        onChange={SelectImageOverlay}
      />
      <button
        onClick={() => document.getElementById("geoJsonMapInput")?.click()}
        className="w-12 h-12 bg-green-600 hover:bg-green-700 text-white font-semibold p-2  rounded-full shadow-md fixed bottom-4 left-4 m-6 z-[1000]"
      >
        <FontAwesomeIcon icon={faMap} />
      </button>
      <div className="fixed bottom-4 left-20 m-6 z-[1000]">
        <button
          onClick={exportDrafts}
          className="w-12 h-12 bg-gray-800 hover:bg-gray-700 text-white font-semibold p-2  rounded-full shadow-md"
        >
         <FontAwesomeIcon icon={faFileExport} />
        </button>
      </div>
      <div className="fixed bottom-4 left-[15vh] m-6 z-[1000]">
        <button
          onClick={toggleTable}
          className="w-12 h-12 bg-gray-800 hover:bg-gray-700 text-white font-semibold p-2  rounded-full shadow-md"
        >
          <FontAwesomeIcon icon={faMagnifyingGlass} className="" />
        </button>
      </div>
    </div>
  );
};

export default MainMap;
