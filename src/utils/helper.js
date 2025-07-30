export const calculateOffsetPoint = (start, end, fraction) => {
    const x1 = start[0];
    const y1 = start[1];
    const x2 = end[0];
    const y2 = end[1];

    // Calculate the direction vector and scale it by the fraction
    const offsetX = x2 - fraction * (x2 - x1);
    const offsetY = y2 - fraction * (y2 - y1);

    return [offsetX, offsetY];
  }
/*
  export const getColorByPercentage = (percentage) => {
    const r = Math.round((percentage / 100) * 255);
    const b = 255 - r;
    return `rgb(${r}, 0, ${b})`;
  }
*/
  export const getColorFromScale = (value, min, max) => {
    if (value < min) value = min;
    if (value > max) value = max;
    const normalized = (value - min) / (max - min);
    const r = Math.round(255 * normalized);
    const g = 0;
    const b = Math.round(255 * (1 - normalized));
    return `rgba(${r}, ${g}, ${b}, 0.4)`;
  }
export const getColorByPercentage = (percentage) => {
  /*
  const clampedPercentage = Math.max(0, Math.min(100, percentage)) / 100; // Normalize to 0-1
  const startColor = '#B5D839';
  const endColor = '#FA5757';

  const hexToRgb = (hex) => {
    const bigint = parseInt(hex.slice(1), 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255
    };
  };

  const rgbToHex = (r, g, b) => {
    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase()}`;
  };

  const startRGB = hexToRgb(startColor);
  const endRGB = hexToRgb(endColor);

  const interpolatedRGB = {
    r: Math.round(startRGB.r + clampedPercentage * (endRGB.r - startRGB.r)),
    g: Math.round(startRGB.g + clampedPercentage * (endRGB.g - startRGB.g)),
    b: Math.round(startRGB.b + clampedPercentage * (endRGB.b - startRGB.b))
  };

  return rgbToHex(interpolatedRGB.r, interpolatedRGB.g, interpolatedRGB.b);
  */
  if(percentage < 75 ) {return '#B5D839';}
  else if(percentage >= 75 && percentage <= 85 ) {return '#F3C868';}
  else {return '#FF6F59';}
};

export const getColorFromWhiteToRed = (percentage) => {
  percentage = Math.max(0, Math.min(100, percentage)); // Clamp between 0-100
  if(percentage == 100){ percentage = 0;}
  let greenBlueValue = Math.round(255 * (percentage / 100)); // Scale Green/Blue
  return `rgba(255, ${greenBlueValue}, ${greenBlueValue}, 0.4)`; // Red stays 255
}

export const removeStringFromKeys = (obj, stringToRemove) => {
  if (typeof obj !== 'object' || obj === null) return obj;

  // Handle arrays recursively
  if (Array.isArray(obj)) {
      return obj.map(item => removeStringFromKeys(item, stringToRemove));
  }

  // Handle objects
  return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => {
          const newKey = key.replace(stringToRemove, "");
          const newValue = removeStringFromKeys(value, stringToRemove);
          return [newKey, newValue];
      })
  );
}