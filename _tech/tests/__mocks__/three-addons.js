// Minimal CSS2DObject mock
class CSS2DObject {
  constructor(el) {
    this.element = el;
    this.position = { set: () => {} };
  }
}

export { CSS2DObject };
export default { CSS2DObject };
