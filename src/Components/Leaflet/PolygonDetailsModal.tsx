import React from "react";

type PolygonDetailsModalProps = {
  showModal: boolean;
  polygonID: number;
  polygonName: string;
  imageUrl: string | null;
  details: string;
  selectedColor: string;
  handleImageInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  savePolygonData: () => void;
  closeModal: () => void;
  setPolygonID: (polyid: number) => void; // Add these props
  setPolygonName: (name: string) => void; // Add these props
  setImageUrl: (url: string | null) => void; // Add these props
  setDetails: (details: string) => void; // Add these props
  setSelectedColor: (color: string) => void; // Add these props
};

const PolygonDetailsModal: React.FC<PolygonDetailsModalProps> = ({
  showModal,
  polygonID,
  polygonName,
  imageUrl,
  details,
  selectedColor,
  handleImageInputChange,
  savePolygonData,
  closeModal,
  setPolygonID, // Add these props
  setPolygonName, // Add these props
  setImageUrl, // Add these props
  setDetails, // Add these props
  setSelectedColor, // Add these props
}) => {
  const isFormValid = () => {
    // Add your validation logic here
    return polygonID !== 0 && polygonName.trim() !== "";
  };

  const handleSave = () => {
    if (isFormValid()) {
      savePolygonData();
      closeModal();
    } else {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
    }
  };

  const handleClose = () => {
    const confirmLogout = window.confirm("คุณต้องการยกเลิกหรือไม่?");
    if (confirmLogout) {
        closeModal()
    }
  };

  if (!showModal) {
    return null;
  }
  return (
    <div
      className={`z-[999] p-4 fixed top-0 right-0 mt-[8.4vh] mb-[90px] h-full w-[450px] bg-gray-200  backdrop-blur-[1px] shadow-lg transition-transform duration-300 transform ${
        showModal ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <h3 className="text-lg font-semibold mb-4">รายละเอียดโพลีกอน</h3>
      <div className="mb-4">
        <span>รหัส</span>
        <input
          className="w-full p-2 border border-gray-300 rounded-md"
          type="number"
          placeholder="รหัส"
          value={polygonID}
          onChange={(e) => setPolygonID(parseInt(e.target.value))} 

        />
      </div>
      <div className="mb-4">
        <span className="">ชื่อ</span>
        <input
          className="w-full p-2 border border-gray-300 rounded-md"
          type="text"
          placeholder="ชื่อ"
          value={polygonName}
          onChange={(e) => setPolygonName(e.target.value)} // Use setPolygonName prop
        />
      </div>
      {/* <div className="mb-4">
        <input
          className="w-full p-2 border border-gray-300 rounded-md"
          type="text"
          placeholder="Image URL"
          value={imageUrl || ""}
          onChange={(e) => setImageUrl(e.target.value)} // Use setImageUrl prop
        />
      </div>
      <div className="mb-4">
        <input
          type="file"
          accept="image/*"
          className="w-full p-2 border border-gray-300 rounded-md"
          onChange={handleImageInputChange}
        />
      </div> */}
      <div className="mb-4">
        <span className="">รายละเอียด</span>
        <input
          className="w-full p-2 border border-gray-300 rounded-md"
          type="text"
          placeholder="รายละเอียด (ถ้ามี)"
          value={details}
          onChange={(e) => setDetails(e.target.value)} // Use setDetails prop
        />
      </div>
      <div className="mb-4">
        <span className="">สี</span>
        <input
          className="w-full p-2 border border-gray-300 rounded-md"
          type="color"
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)} // Use setSelectedColor prop
        />
      </div>
      <div className="flex justify-end">
        <button
          className="px-4 py-2 mr-2 text-gray-500 hover:text-gray-700 focus:outline-none"
          onClick={handleClose}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 focus:outline-none"
          onClick={handleSave}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default PolygonDetailsModal;
