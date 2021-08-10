const polyline = require('@mapbox/polyline');
const urlencode = require('urlencode');
const { createSpectrum, rgbToHexString, hexStringToRGB } = require('./colorUtils');

// In [lat, lng] order, which matches the polyline library. If your data is in the opposite order, use the swapLngLat function from coordsUtils.
const coords = [[0.3552287864025097, 32.756562742175085], [0.3512484642427417, 32.77583173252051]];

const startColor = '#FF512F';
const endColor = '#F09819';
const strokeWidth = 4;
const mapboxToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
const colorA = hexStringToRGB(startColor);
const colorB = hexStringToRGB(endColor);
const spectrumColors = createSpectrum(colorA, colorB, coords.length - 1);

function makePathWithGradient() {
  const pathStrings = [];

  for (let i = 0; i < coords.length - 1; i++) {
    const path = polyline.encode([coords[i], coords[i + 1]]);
    pathStrings.push(`path-${strokeWidth}+${spectrumColors[i]}(${path})`); // format from https://docs.mapbox.com/api/maps/#path
  }

  return pathStrings.join(',');
}

const firstCoord = coords[0];
const lastCoord = coords[coords.length - 1];
const startMarker = `pin-s-a+${rgbToHexString(colorA)}(${firstCoord[1]},${firstCoord[0]})`;
const endMarker = `pin-s-b+${rgbToHexString(colorB)}(${lastCoord[1]},${lastCoord[0]})`;

const pathWithGradient = makePathWithGradient() + ',' + startMarker + ',' + endMarker;

function makeOutput() {
  const args = process.argv.slice(2);

  const rawPathGradient = args.indexOf('-r') !== -1;
  if (rawPathGradient) {
    return pathWithGradient;
  }

  const makeFullUrl = args.indexOf('-f') !== -1;
  if (makeFullUrl) {
    return `https://api.mapbox.com/styles/v1/mapbox/light-v9/static/${urlencode(pathWithGradient)}/auto/700x700?access_token=${mapboxToken}`;
  }

  return urlencode(pathWithGradient);
}

console.log(makeOutput());