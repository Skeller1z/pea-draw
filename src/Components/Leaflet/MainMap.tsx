import { LatLngBoundsLiteral } from 'leaflet';
import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import { FeatureGroup, ImageOverlay, MapContainer } from 'react-leaflet'
import { GeoJSON } from "react-leaflet";
import Topbar from '../Topbar/Topbar';
import { EditControl } from 'react-leaflet-draw';
import { conformToRightHandRule } from './ConvertRightHand'
import { data } from './data/data';
import { data3 } from './data/data3';
import { getGeoJson } from './data/TestFunc'
import L from 'leaflet';
type State = {
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
  imageUrl: null,
  polygonName: "",
  showModal: false,
  infoModal: false,
  createdLayer: null,
  details: "",
  imageFile: null,
  showPopup: false,
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
  const [imageOverlayUrl, setImageOverlayUrl] = useState("https://bsv-th-authorities.com/impage_pro/รายคณะ.jpg");
  const [geoJsonData, setGeoJsonData] = useState<any>(data);
  const [importedData, setImportedData] = useState<any[]>([]);
  const [geoJson, setGeoJson] = useState<any>(null);
  const [coordinates, setCoordinates] = useState<any[]>([]);
  const featureGroupRef = useRef();
  
  useEffect(() => {
    if (featureGroupRef.current) {
      onFeatureGroupReady(featureGroupRef.current);
    }
  }, []);

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
  const onDeleted = (e) => {
    let numDeleted = 0;
    if (geoJsonData) {
      const updatedGeoJsonData = { ...geoJsonData };
      e.layers.eachLayer((layer) => {
        numDeleted += 1;
        const deletedFeature = layer.feature;
        const updatedFeatures = updatedGeoJsonData.features.filter(
          (feature) => feature !== deletedFeature
        );
        updatedGeoJsonData.features = updatedFeatures;
      });
      setGeoJsonData(updatedGeoJsonData);
      console.log(`onDeleted: removed ${numDeleted} layers`, e);
    } else {
      console.error('GeoJSON data is not defined.');
    }
  };

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
  

  const onEdited = (e) => {
    let numEdited = 0;
    e.layers.eachLayer((layer) => {
      numEdited += 1;
    });
    console.log(`_onEdited: edited ${numEdited} layers`, e);
  };
  
  const importGeoJson = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const importedData = JSON.parse(e.target?.result as string);
          setImportedData(importedData.features || []);
          setGeoJsonData(importedData);
          setCoordinates(importedData.coordinates)
          console.log(importedData)
          setImageOverlayUrl(importedData.imageOverlayUrl)
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

      layer.on('click', function () {
        // Your onClick logic here
        console.log('Polygon clicked');
      });
    } else {
      // ...
    }
  };


  const toggleSidebar = () => {
    setIsTopBarVisible(!isTopBarVisible);
  };

  const toggleTable = () => {
    console.log(showSearch);
    setSearch(!showSearch);
  };

  const renderGeoJSONOnEachFeature = (feature: any, layer: any) => {
    if (feature.properties) {
      const popupContent = `
      <div class="max-w-sm p-4">
        <h3 class="text-lg font-bold">${feature.properties.name}</h3>
        <img src="${feature.properties.image || image}" alt="${
          feature.properties.name
        }" class="mt-2 mb-4" width="100" />
        <p class="text-sm">${feature.properties.details || ""}</p>
      </div>`;
      layer.bindPopup(popupContent, { maxWidth: 400, className: 'stylePopup' });

      layer.on('mouseover', function () {
        layer.setStyle({ fillOpacity: 0.2 }); // Change opacity or any other style
        layer.openPopup();
      });
  
      layer.on('mouseout', function () {
        layer.setStyle({ fillOpacity: 0 }); // Hide the polygon on mouseout
        layer.closePopup();
      });
  
      layer.on('click', function () {
        setState((prevState) => ({
          ...prevState,
          // infoModal: true,
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
    // const defaultStyle = {
    //   fillColor: "none",
    //   fillOpacity: 0,
    //   color: "none",
    //   weight: 0,
    // };

    if (feature && feature.properties && feature.properties.color) {
      return {
        // ...defaultStyle, // override defaults with properties if they exist
        fillColor: feature.properties.color,
        color: feature.properties.color,
      };
    }

    // return defaultStyle;
  };

  return (
    <div className="w-full">
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
    >
      <ImageOverlay
        bounds={bounds}
        url={imageOverlayUrl} // ใช้ URL จาก selectedData
      /> 
        <FeatureGroup ref={featureGroupRef} >
            {adminMode ? (
              <EditControl
                position="topright"
                onCreated={onCreated}
                onDeleted={onDeleted}
                onEdited={onEdited} // Add this line
                draw={{
                  rectangle: false,
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
  )
}

export default MainMap