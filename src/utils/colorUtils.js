export const COLOR_PALETTES = {
  originalLadybug: [
    [75, 107, 169], [115, 147, 202], [170, 200, 247], [193, 213, 208],
    [245, 239, 103], [252, 230, 74], [239, 156, 21], [234, 123, 0],
    [234, 74, 0], [234, 38, 0]
  ],
  nuancedLadybug: [
    [49, 54, 149], [69, 117, 180], [116, 173, 209], [171, 217, 233],
    [224, 243, 248], [255, 255, 191], [254, 224, 144], [253, 174, 97],
    [244, 109, 67], [215, 48, 39], [165, 0, 38]
  ],
  multiColoredLadybug: [
    [4, 25, 145], [7, 48, 224], [7, 88, 255], [1, 232, 255],
    [97, 246, 156], [166, 249, 86], [254, 244, 1], [255, 121, 0],
    [239, 39, 0], [138, 17, 0]
  ],
  cividis: [
    [0, 32, 81], [60, 77, 110], [127, 124, 117], [187, 175, 113], [253, 234, 69]
  ]
};

export const PALETTE_NAMES = {
  originalLadybug: 'Original Ladybug',
  nuancedLadybug: 'Nuanced Ladybug',
  multiColoredLadybug: 'Multi-colored',
  cividis: 'Cividis'
};

export const getColor = (value, min, max, paletteName = 'originalLadybug') => {
  if (value === undefined || value === null || min === undefined || max === undefined) return '#d4d4d8';
  
  const palette = COLOR_PALETTES[paletteName] || COLOR_PALETTES.originalLadybug;
  
  if (min >= max) {
    const midColor = palette[Math.floor(palette.length / 2)];
    return `rgb(${midColor.join(',')})`;
  }
  
  let t = (value - min) / (max - min);
  t = Math.max(0, Math.min(1, t)); 
  
  const i = t * (palette.length - 1);
  const iLow = Math.floor(i);
  const iHigh = Math.ceil(i);
  const w = i - iLow; 
  
  const c1 = palette[iLow];
  const c2 = palette[iHigh];
  
  const r = Math.round(c1[0] + (c2[0] - c1[0]) * w);
  const g = Math.round(c1[1] + (c2[1] - c1[1]) * w);
  const b = Math.round(c1[2] + (c2[2] - c1[2]) * w);
  
  return `rgb(${r},${g},${b})`;
};

export const getGradientString = (paletteName, direction = 'to right') => {
  const palette = COLOR_PALETTES[paletteName] || COLOR_PALETTES.originalLadybug;
  const stops = palette.map(c => `rgb(${c.join(',')})`).join(', ');
  return `linear-gradient(${direction}, ${stops})`;
};
