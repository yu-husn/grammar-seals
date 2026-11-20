export function normalizeFontScale(_value?:unknown){return 1}
export function applyFontScale(value:unknown){const scale=normalizeFontScale(value);document.documentElement.style.setProperty('--reading-scale',String(scale));document.documentElement.dataset.fontScale=String(Math.round(scale*100))}
