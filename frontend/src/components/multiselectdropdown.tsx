import React, { useState } from "react";

// Define props type for the dropdown component
interface MultiSelectDropdownProps {
  options: string[];
  selectedOptions: string[];
  setSelectedOptions: React.Dispatch<React.SetStateAction<string[]>>;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({ options, selectedOptions, setSelectedOptions }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleCheckboxChange = (option: string) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter((item) => item !== option));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };
  const max_length = 23;

  return (
    <div className="dropdown-container">
      <div className="dropdown-header" onClick={() => setDropdownOpen(!dropdownOpen)}>
        {selectedOptions.join(", ").length > max_length // Set max length here
          ? `${selectedOptions.join(", ").slice(0, max_length)}..`
          : selectedOptions.join(", ") || "Select features"}
        {/* <span className="dropdown-arrow">▼</span> */}
        <span className="dropdown-arrow"></span>
      </div>
      {dropdownOpen && (
        <div className="dropdown-options">
          {options.map((option) => (
            <div key={option} className="dropdown-option">
              <label>
                <input
                  type="checkbox"
                  checked={selectedOptions.includes(option)}
                  onChange={() => handleCheckboxChange(option)}
                />
                {option}
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
