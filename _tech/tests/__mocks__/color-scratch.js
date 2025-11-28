// Simple scratch color object with copy for nebula tests
function ColorScratch(r = 0, g = 0, b = 0) {
  if (!(this instanceof ColorScratch)) return new ColorScratch(r, g, b);
  this.r = r; this.g = g; this.b = b;
}
ColorScratch.prototype.copy = function (c) { this.r = c.r || 0; this.g = c.g || 0; this.b = c.b || 0; return this; };

export { ColorScratch };
export default ColorScratch;
