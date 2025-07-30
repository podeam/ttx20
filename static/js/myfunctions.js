function calculateOffsetPoint(start, end, fraction) {
    const x1 = start[0];
    const y1 = start[1];
    const x2 = end[0];
    const y2 = end[1];

    // Calculate the direction vector and scale it by the fraction
    const offsetX = x2 - fraction * (x2 - x1);
    const offsetY = y2 - fraction * (y2 - y1);

    return [offsetX, offsetY];
  }

function getColorByPercentage(percentage) {
  const r = Math.round((percentage / 100) * 255);
  const b = 255 - r;
  return `rgb(${r}, 0, ${b})`;
}
/*
function getColorFromWhiteToRed(percentage) {
  percentage = Math.max(0, Math.min(100, percentage)); // Clamp between 0-100
  if(percentage == 100){ percentage = 0;}
  let greenBlueValue = Math.round(255 * (percentage / 100)); // Scale Green/Blue
  return `rgba(255, ${greenBlueValue}, ${greenBlueValue}, 0.4)`; // Red stays 255
}
*/

function removeStringFromKeys(obj, stringToRemove) {
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

function clearGraphics() {
  graphicsLayer.removeAll();
  $('#legendDiv').hide();
}
function removeColorCountry(){
  if(graphicsLayerColor != undefined){
    graphicsLayerColor.removeAll();
  }
}

function getColorFromScale(value, min, max) {
  // Ensure value is within range
  if (value < min) value = min;
  if (value > max) value = max;

  // Normalize value between 0 and 1
  const normalized = (value - min) / (max - min);

  // Interpolate between blue (#0000FF) and red (#FF0000)
  const r = Math.round(255 * normalized); // Red increases with value
  const g = 0;                            // Keep green constant
  const b = Math.round(255 * (1 - normalized)); // Blue decreases with value

  return `rgba(${r}, ${g}, ${b}, 0.4)`;
}
