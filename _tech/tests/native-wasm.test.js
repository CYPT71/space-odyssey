import { dist3, lerpFast, clampFast, smoothstepFast } from '../theme/assets/js/native/fast-math.js';
import { parseWithWasm } from '../theme/assets/js/native/fast-parser.js';

jest.mock('../theme/assets/js/galaxy/space-tree-internal.js', () => {
  const parseFileSystem = jest.fn(() => ({ parsed: true }));
  return { parseFileSystem, parseSpaceTree: parseFileSystem };
});

describe('fast-math fallback', () => {
  it('computes distance and lerp via JS fallback when wasm is absent', () => {
    expect(dist3(0, 0, 0, 3, 4, 12)).toBeCloseTo(13);
    expect(lerpFast(0, 10, 0.5)).toBe(5);
    expect(clampFast(20, 0, 5)).toBe(5);
    expect(smoothstepFast(0, 1, 0.5)).toBeCloseTo(0.5, 1);
  });
});

describe('fast-parser fallback', () => {
  const { parseFileSystem } = jest.requireMock('../theme/assets/js/galaxy/space-tree-internal.js');

  beforeEach(() => {
    global.fetch = jest.fn(() => Promise.resolve({ ok: false }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('invokes JS parser when wasm is unavailable', async () => {
    const files = [{ path: '/foo.md', url: '/foo' }];
    const tree = await parseWithWasm(files);
    expect(fetch).toHaveBeenCalled();
    expect(parseFileSystem).toHaveBeenCalledWith(files);
    expect(tree).toEqual({ parsed: true });
  });
});
