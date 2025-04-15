import { useState, useEffect } from "react";
import "./App.css";
import medicationData from "../../src/data/image_urls.json";

function App() {
  const [medications, setMedications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [subcategoryFilter, setSubcategoryFilter] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [isLoading, setIsLoading] = useState(false);

  // Extract unique subcategories
  const subcategories = [
    ...new Set(medicationData.map((med) => med.subcategory)),
  ].sort();

  useEffect(() => {
    // Filter medications based on search term and filters
    let filtered = [...medicationData];

    if (searchTerm) {
      filtered = filtered.filter((med) =>
        med.medication.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (subcategoryFilter) {
      filtered = filtered.filter(
        (med) => med.subcategory === subcategoryFilter
      );
    }

    // Sort medications by name by default
    filtered.sort((a, b) => a.medication.localeCompare(b.medication));

    setMedications(filtered);
  }, [searchTerm, subcategoryFilter]);

  const handleDownloadImage = async (imageUrl, medicationName) => {
    if (!imageUrl) return;

    try {
      setIsLoading(true);

      // For iOS Safari and other mobile browsers that don't support direct download
      if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        // Open image in new tab - this is more reliable on mobile
        window.open(imageUrl, "_blank");
        setIsLoading(false);
        return;
      }

      // For desktop browsers
      const response = await fetch(imageUrl, {
        method: "GET",
        mode: "cors", // Try with no-cors if needed
        cache: "no-cache",
        headers: {
          "Content-Type": "application/octet-stream",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      const sanitizedName = medicationName
        .replace(/[^\w\s]/gi, "")
        .replace(/\s+/g, "_");

      a.style.display = "none";
      a.href = url;
      a.download = `${sanitizedName}.jpg`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading image:", error);
      alert("Failed to download. Opening in new tab instead.");
      window.open(imageUrl, "_blank");
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSubcategoryFilter("");
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Medication Image Viewer</h1>
        <p className="app-subtitle">Browse and search medication images</p>
      </header>

      <div className="control-panel">
        <div className="search-box">
          <svg
            className="search-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search medications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm("")}>
              ×
            </button>
          )}
        </div>

        <div className="filter-controls">
          <div className="filter-row">
            <div className="filter-group subcategory-filter">
              <label>Filter by Type</label>
              <select
                value={subcategoryFilter}
                onChange={(e) => setSubcategoryFilter(e.target.value)}
              >
                <option value="">All Types</option>
                {subcategories.map((subcategory, index) => (
                  <option key={index} value={subcategory}>
                    {subcategory}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="filter-actions">
            <button className="clear-filters" onClick={clearFilters}>
              Clear Filters
            </button>
            <div className="view-toggle">
              <button
                className={viewMode === "grid" ? "active" : ""}
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
              </button>
              <button
                className={viewMode === "list" ? "active" : ""}
                onClick={() => setViewMode("list")}
                aria-label="List view"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="results-stats">
        <p>
          Showing <strong>{medications.length}</strong> of{" "}
          {medicationData.length} medications
        </p>
      </div>

      <div className={`medications-container ${viewMode}`}>
        {medications.length > 0 ? (
          medications.map((med, index) => (
            <div className="medication-card" key={index}>
              <div className="medication-image">
                {med.image ? (
                  <>
                    <img
                      src={med.image.src}
                      alt={med.image.alt || med.medication}
                      title={med.image.alt || med.medication}
                      loading="lazy"
                    />
                    <button
                      className={`download-button ${
                        isLoading ? "loading" : ""
                      }`}
                      onClick={() =>
                        handleDownloadImage(med.image.src, med.medication)
                      }
                      title="Download or view image"
                      aria-label="Download or view image"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <svg className="spinner" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7 10 12 15 17 10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                      )}
                    </button>
                  </>
                ) : (
                  <div className="no-image">No Image Available</div>
                )}
              </div>
              <div className="medication-info">
                <h3>{med.medication}</h3>
                <div className="medication-details">
                  {med.concentration && (
                    <span className="concentration">{med.concentration}</span>
                  )}
                  {med.dosage_form && (
                    <span className="dosage-form">{med.dosage_form}</span>
                  )}
                </div>
                <div className="medication-categories">
                  <span className="subcategory-tag">{med.subcategory}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p>No medications found matching your filters</p>
            <button onClick={clearFilters}>Clear Filters</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
