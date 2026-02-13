export const loadJSZip = () => {
  return new Promise((resolve, reject) => {
    if (window.JSZip) return resolve(window.JSZip);
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
    script.onload = () => resolve(window.JSZip);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

export const createDataset = async (id, name, type, csvText, zipObject = null, onAddObjectUrl = null) => {
  console.log(`createDataset called: id=${id}, name=${name}, type=${type}`);
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) throw new Error("CSV file is empty or invalid");

  const headers = lines[0].split(',').map(h => h.trim());
  const cols = { in: [], out: [], img: [] };
  headers.forEach(h => {
    if (h.startsWith('in:')) cols.in.push(h);
    else if (h.startsWith('out:')) cols.out.push(h);
    else if (h.startsWith('img:')) cols.img.push(h);
  });
  console.log(`Columns: in=${cols.in.length}, out=${cols.out.length}, img=${cols.img.length}`);

  const parsedData = await Promise.all(lines.slice(1).map(async (line, idx) => {
    const values = line.split(',').map(v => v.trim());
    const row = { id: idx };
    await Promise.all(headers.map(async (header, i) => {
      let val = values[i];
      if (header.startsWith('img:') && val) {
         const originalFileName = val.split('/').pop();
         row[`_imgName_${header}`] = originalFileName;
         if (type === 'builtin') {
             val = `/${id}/${val}`;
         } else if (zipObject) {
             let file = zipObject.file(val);
             if (!file) {
                 const fileName = val.split('/').pop();
                 const files = Object.keys(zipObject.files);
                 const match = files.find(f => f.endsWith(fileName) && !f.startsWith('__MACOSX'));
                 if (match) file = zipObject.file(match);
             }
             if (file) {
                 const blob = await file.async('blob');
                 val = URL.createObjectURL(blob);
                 if (onAddObjectUrl) {
                     onAddObjectUrl(val);
                 }
             }
         }
      }
      row[header] = isNaN(Number(val)) ? val : Number(val);
    }));
    return row;
  }));

  const numericCols = [...cols.in, ...cols.out].filter(col => {
    return parsedData.some(row => typeof row[col] === 'number');
  });

  const stringCols = [...cols.in, ...cols.out].filter(col => {
    return parsedData.some(row => typeof row[col] === 'string');
  });

  const calculatedRanges = {};
  numericCols.forEach(col => {
    const values = parsedData.map(d => d[col]).filter(v => typeof v === 'number');
    if (values.length > 0) {
      calculatedRanges[col] = { min: Math.min(...values), max: Math.max(...values) };
    }
  });

  let bestCol = '';
  let maxUnique = -1;
  numericCols.forEach(col => {
    const unique = new Set(parsedData.map(r => r[col])).size;
    if (unique > maxUnique) { maxUnique = unique; bestCol = col; }
  });
  if (!bestCol && cols.out.length > 0) bestCol = cols.out[0];
  if (!bestCol && cols.in.length > 0) bestCol = cols.in[0];

  return {
    id, name, type,
    data: parsedData,
    columns: cols,
    numericCols,
    stringCols,
    ranges: calculatedRanges,
    defaultColorBy: bestCol,
    defaultImgCol: cols.img.length > 0 ? cols.img[0] : null
  };
};

export const loadBuiltinDatasets = async (onAddObjectUrl = null) => {
  const datasetFolders = ['Multiple -Image-Layouts', 'daylight-factor', 'box-without-img'];
  const loadedDatasets = [];
  for (const folder of datasetFolders) {
    try {
      const csvUrl = `/${folder}/data.csv`;
      console.log(`Loading dataset from: ${csvUrl}`);
      const csvResponse = await fetch(csvUrl);
      console.log(`Response status: ${csvResponse.status}, ok: ${csvResponse.ok}`);
      if (!csvResponse.ok) continue;
      
      const csvText = await csvResponse.text();
      console.log(`CSV loaded for ${folder}, lines: ${csvText.split('\n').length}`);
      const dataset = await createDataset(
        folder,
        folder.replace(/-/g, ' '),
        'builtin',
        csvText,
        null,
        onAddObjectUrl
      );
      
      if (dataset) {
        loadedDatasets.push(dataset);
        console.log(`Dataset ${folder} loaded successfully, ${dataset.data.length} rows`);
      }
    } catch (e) {
      console.error(`Failed to load dataset ${folder}:`, e);
    }
  }
  console.log(`Total loaded datasets: ${loadedDatasets.length}`);
  return loadedDatasets;
};
