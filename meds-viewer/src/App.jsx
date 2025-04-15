import { useState, useEffect } from "react";
import "./App.css";
import medicationData from "../../src/data/image_urls.json";

function App() {
  const [medications, setMedications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [subcategoryFilter, setSubcategoryFilter] = useState("");

  // Extract unique categories and subcategories
  const categories = [...new Set(medicationData.map((med) => med.category))];
  const subcategories = [
    ...new Set(medicationData.map((med) => med.subcategory)),
  ];

  useEffect(() => {
    // Filter medications based on search term and filters
    let filtered = [...medicationData];

    if (searchTerm) {
      filtered = filtered.filter((med) =>
        med.medication.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter((med) => med.category === categoryFilter);
    }

    if (subcategoryFilter) {
      filtered = filtered.filter(
        (med) => med.subcategory === subcategoryFilter
      );
    }

    setMedications(filtered);
  }, [searchTerm, categoryFilter, subcategoryFilter]);

  return (
    <div className="container">
      <h1>Medication Image Viewer</h1>

      <div className="filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search medications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-selects">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={subcategoryFilter}
            onChange={(e) => setSubcategoryFilter(e.target.value)}
          >
            <option value="">All Subcategories</option>
            {subcategories.map((subcategory, index) => (
              <option key={index} value={subcategory}>
                {subcategory}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="stats">
        <p>
          Showing {medications.length} of {medicationData.length} medications
        </p>
      </div>

      <div className="medications-grid">
        {medications.map((med, index) => (
          <div className="medication-card" key={index}>
            <div className="medication-image">
              {med.image ? (
                <img
                  src={med.image.src}
                  alt={med.image.alt || med.medication}
                  title={med.image.alt || med.medication}
                />
              ) : (
                <div className="no-image">No Image Available</div>
              )}
            </div>
            <div className="medication-info">
              <h3>{med.medication}</h3>
              <p>
                {med.concentration} {med.dosage_form}
              </p>
              <p className="category">{med.subcategory}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
