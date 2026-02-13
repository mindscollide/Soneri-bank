import React, { useRef, useState } from "react";

const IconElement = ({
  iconClass,
  onClick,
  applyClass = "",
  onFileChange,
  isFile = false,
}) => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleClick = () => {
    fileInputRef.current && fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    onFileChange && onFileChange(e); // forward the event
  };

  return (
    <>
      {/* Show icon only if a file is selected */}

      <i
        className={`${iconClass} ${applyClass}`}
        onClick={isFile ? handleClick : onClick}
      />

      {isFile && (
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      )}
    </>
  );
};

export default IconElement;
