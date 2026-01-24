# Design Explorer

A powerful web-based tool for visualizing and exploring design data through interactive parallel coordinates plots, data tables, and visual galleries.

## Features

- **Parallel Coordinates Visualization**: Interactive multi-dimensional data visualization with filtering capabilities
- **Data Table**: Sortable and filterable data table with selection support
- **Visual Gallery**: Image gallery with zoom and pan controls for visual design exploration
- **Multiple Color Palettes**: Choose from various color schemes including Ladybug and Cividis palettes
- **Flexible Legend Positioning**: Position legends at top, bottom, left, or right
- **Export Options**: Export visualizations as PNG, JPG, or SVG formats
- **Dataset Management**: Load built-in sample datasets or upload your own CSV/ZIP files

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/LoftyTao/design-explorer-react.git
cd design-explorer-react
```

2. Install dependencies:
```bash
npm install
```

### Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

### Building for Production

Build the application for production:
```bash
npm run build
```

The optimized files will be output to the `dist` directory.

### Preview Production Build

Preview the production build locally:
```bash
npm run preview
```

## Building Windows Executable

This project includes a GitHub Actions workflow that automatically builds a Windows executable (.exe) when you push a version tag.

### Manual Build (Local)

To build a Windows executable locally:

1. Install Electron and Electron Builder:
```bash
npm install --save-dev electron electron-builder
```

2. Build the production files:
```bash
npm run build
```

3. Create an Electron main process file (`electron-main.js`):
```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  win.loadFile('dist/index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
```

4. Update `package.json` to include Electron configuration:
```json
{
  "main": "electron-main.js",
  "build": {
    "appId": "com.designexplorer.app",
    "productName": "Design Explorer",
    "win": {
      "target": "nsis"
    }
  }
}
```

5. Build the executable:
```bash
npx electron-builder --win --x64
```

The executable will be generated in the `dist` directory.

### Automated Build (GitHub Actions)

To trigger an automated build and release:

1. Create and push a version tag:
```bash
git tag v1.0.0
git push origin v1.0.0
```

2. The GitHub Actions workflow will automatically:
   - Build the application
   - Package it as a Windows executable
   - Create a GitHub release with the executable attached

## Usage

### Loading Data

- **Built-in Datasets**: Select from pre-loaded sample datasets
- **Upload**: Upload your own CSV or ZIP files containing a `data.csv` file

### CSV Format

CSV files should follow this format:
```
in:parameter1,in:parameter2,out:result1,out:result2,img:image_path
10,20,100,200,image1.png
15,25,150,250,image2.png
```

- `in:` prefix for input parameters
- `out:` prefix for output results
- `img:` prefix for image paths

### Filtering and Sorting

- **Filter**: Click and drag on any axis in the parallel coordinates plot to create filters
- **Sort**: Click column headers in the data table to sort by that column
- **Multi-sort**: Click multiple columns to apply multi-column sorting

### Exporting

Use the Export button in the Parallel Coordinates section to download visualizations as PNG, JPG, or SVG.
