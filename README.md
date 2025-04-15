# Medication Image Viewer

A web application for browsing and searching medication images. This application displays medication data collected from nhathuoclongchau.com.vn.

## Project Overview

This project consists of two main parts:

1. **Data Collection**: Scripts to convert a markdown medication list to structured JSON data and to search/download medication images from online pharmacies
2. **Image Viewer**: A web application to browse and search the collected medication data with their images

## Project Structure

```
├── scripts/                  # Backend scripts
│   ├── data-collection/      # Scripts for collecting data from web sources
│   │   └── search_all_medications.js
│   └── data-processing/      # Scripts for processing and converting data
│       ├── convert_to_json.js
│       ├── convert_keys.js
│       └── medication_mapping.js
├── src/                      # Source files
│   └── data/                 # Data files
│       ├── medication_list.md
│       ├── medication_list.json
│       ├── medication_list_en.json
│       └── image_urls.json
├── meds-viewer/              # Frontend React application
│   ├── src/
│   ├── public/
│   └── ...
├── public/                   # Public assets
│   └── images/               # Downloaded medication images
├── package.json              # Project configuration
└── README.md                 # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn

### Installation

1. Clone the repository

   ```
   git clone <repository-url>
   cd medication-image-viewer
   ```

2. Install dependencies

   ```
   npm install
   cd meds-viewer && npm install
   ```

## Usage

### Data Processing

1. Convert markdown medication list to JSON

   ```
   npm run convert-md
   ```

2. Convert JSON keys from Vietnamese to English

   ```
   npm run convert-keys
   ```

### Data Collection

Search and collect medication images:

```
npm run search-images
```

### Run Web Application

Start the React application:

```
npm run start-viewer
```

Then open your browser and navigate to <http://localhost:5173>

## Features

- Browse medications with their images
- Search medications by name
- Filter by category and subcategory
- Responsive design for desktop and mobile

## Data Workflow

1. `medication_list.md` - Original medication list in markdown format
2. `medication_list.json` - Medication data converted to JSON
3. `medication_list_en.json` - Medication data with English keys
4. `image_urls.json` - Medication data enriched with image URLs

## Technologies Used

- **Backend**: Node.js, Puppeteer
- **Frontend**: React, Vite
- **Data Processing**: Marked.js, fs-extra

## License

This project is for educational purposes only. The medication data and images are property of their respective owners.
