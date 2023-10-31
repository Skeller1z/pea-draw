import React, { useRef, useState } from 'react'
import pea from '../../Assets/logo63_2.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHouse, faFileImport, faMagnifyingGlass, faRightFromBracket, faEye, faExpand } from '@fortawesome/free-solid-svg-icons';
import { RadioGroup } from 'devextreme-react';
import { click } from '@testing-library/user-event/dist/click';


const Topbar = ({importGeoJson,toggleTable,isTopBarVisible,toggleSidebar}) => {

    const menu = [
        {
            label: "Import",
            icon: faFileImport,
            click: importGeoJson
        },
        {
            label: "Home",
            icon: faHouse
        },
        {
            label: "Logout",
            icon: faRightFromBracket
        }
    ]

    return (
        <>

        <div className={` bg-gray-800 text-white p-2 flex items-center justify-between transition-transform duration-100 transform ${
        isTopBarVisible ? "h-92 translate-y-0" : "hidden translate-y-full"
      }`}>
            <div className={`text-2xl font-bold ${isTopBarVisible ? "block" : "hidden"}`}>
                <img src={pea} alt="pea logo" className="h-16" />
               
            </div>
            <div className={`flex items-center space-x-4 ${isTopBarVisible ? "block" : "hidden"}`} >
    
            <input
              id="geoJsonInput"
              type="file"
              accept=".json"
              onChange={importGeoJson}
              style={{ display: "none" }}
            />
            <button onClick={() => document.getElementById("geoJsonInput")?.click()}>Import Drafts</button>
                {menu.map((item, index) => (
                    <div className='p-4 cursor-pointer hover:text-gray-300' key={index} onClick={item.click}>
                        <FontAwesomeIcon icon={item.icon} className='mr-2'/>
                        <span className="">
                            {item.label}
                        </span>
                    </div>
                ))}
            </div>
            </div>
        </>
        
    )
}

export default Topbar