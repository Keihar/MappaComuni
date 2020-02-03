require('./mapBlocker');
require('./mapConfig');
require('./autoComplete.js');
const sourceData = './comdata.json';

import { ScatterplotLayer } from '@deck.gl/layers';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import { HexagonLayer } from '@deck.gl/aggregation-layers';


//  My Personal Functions
const basedLog = (val, base) => {
  return (Math.log(val) / Math.log(base));
}

const getPopColor = (n) => {
  const logBase = 10;
  const absMax = 2638842;

  if (n < 100000) {
    let maxVal = basedLog(100000, logBase);
    let x = (255 / maxVal) * basedLog(n, logBase);
    return [40, x, 40, x];
  }
  else if (n < 500000) {
    let maxVal = basedLog(500000, logBase);
    let x = (255 / maxVal) * basedLog(n, logBase);    
    return [x, 255, 40, 220];
  }
  else {
    let maxVal = basedLog(absMax, logBase);
    let x = (255 / maxVal) * basedLog(n, logBase);    
    return [x, 40, 40, 220];
  }
}

const pFormatter = (num) => {
  if (Math.abs(num) > 999999) {
    return Math.sign(num)*((Math.abs(num)/1000000).toFixed(1)) + 'M'
  }
  else{
    return Math.abs(num) > 999 ? Math.sign(num)*((Math.abs(num)/1000).toFixed(1)) + 'k' : Math.sign(num)*Math.abs(num)
  }
}

const getSymbol = (num) => {
  if (Math.abs(num) > 500000)
    return '★'
  else
    return Math.abs(num) > 100000 ? '♦' : '●'
}

const getRadius = (num) => {
  if (Math.abs(num) > 500000)
    return 20
  else
    return Math.abs(num) > 100000 ? 13 : 10
}

//  Layers
export const scatterplot = () => new ScatterplotLayer({
  id: 'scatter',
  data: sourceData,
  opacity: 0.8,
  filled: true,
  radiusScale: 100,
  radiusMinPixels: 10,
  radiusMaxPixels: 20,
  getPosition: d => [d.lat, d.lng],
  getFillColor: d => getPopColor(d.pop),
  getRadius: d => getRadius(d.pop),

  pickable: true,
  onHover: ({ object, x, y }) => {
    const el = document.getElementById('tooltip');
    if (object) {
      const { istat } = object;
      const { comune } = object;
      const { pop } = object;
      const { lat } = object;
      const { lng } = object;

      el.innerHTML = `
        <header><u>${getSymbol(pop)} ${comune}</u></header>
        <b>Popolazione:</b> ${pFormatter(pop)} <br/>
        <b>Latitudine:</b> ${Math.round(lat*1000)/1000} <br/>
        <b>Longitudine:</b> ${Math.round(lng*1000)/1000} <br/>
        <b>Codice Istat:</b> ${istat} <br>
      `
      el.style.display = 'block';
      el.style.opacity = 0.9;
      el.style.left = x + 'px';
      el.style.top = y + 'px';
    } 
    else {
      el.style.display = 'none';
    }
  },

  onClick: ({object, x, y}) => {
    window.open(`https://it.wikipedia.org/wiki/${object.comune}`)
  },
});

export const heatmap = () => new HeatmapLayer({
  id: 'heat',
  data: sourceData,
  radiusMinPixels: 10,
  getPosition: d => [d.lat, d.lng],
  getWeight: d => basedLog(d.pop, 1.014),
  radiusPixels: 20,
});

export const hexagon = () => new HexagonLayer({
  id: 'hex',
  data: sourceData,
  getPosition: d => [d.lat, d.lng],
  getElevationWeight: d => basedLog(d.pop, 1.14),
  elevationScale: 100,
  extruded: true,
  radius: 2000,
  opacity: 0.6,
  coverage: 0.88,
  lowerPercentile: 50
});


