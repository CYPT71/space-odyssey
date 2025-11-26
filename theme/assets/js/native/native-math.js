/**
 * @fileoverview Native-accelerated math via embedded WASM, with JS fallback.
 * @description Provides fast mulAdd (a * b + c) using a minimal compiled module.
 */

const wasmBytes = new Uint8Array([
    0x00,0x61,0x73,0x6d, 0x01,0x00,0x00,0x00,
    0x01,0x08,0x01,0x60,0x03,0x7f,0x7f,0x7f,0x01,0x7f,
    0x03,0x02,0x01,0x00,
    0x07,0x0a,0x01,0x06,0x6d,0x75,0x6c,0x41,0x64,0x64,0x00,0x00,
    0x0a,0x0c,0x01,0x0a,0x00,0x20,0x00,0x20,0x01,0x6c,0x20,0x02,0x6a,0x0b
]);

const fallback = {
    mulAdd: (a, b, c) => ((a | 0) * (b | 0) + (c | 0)) | 0
};

let cachedExports = null;
let initPromise = null;

const init = () => {
    if (cachedExports) return Promise.resolve(cachedExports);
    if (!initPromise) {
        initPromise = WebAssembly.instantiate(wasmBytes.buffer)
            .then(({ instance }) => {
                cachedExports = instance.exports;
                return cachedExports;
            })
            .catch(() => {
                cachedExports = fallback;
                return cachedExports;
            });
    }
    return initPromise;
};

/**
 * Synchronous mulAdd; kicks off WASM init lazily and falls back immediately.
 * @param {number} a
 * @param {number} b
 * @param {number} c
 * @returns {number}
 */
export const mulAdd = (a, b, c) => {
    if (cachedExports) return (cachedExports.mulAdd || fallback.mulAdd)(a, b, c);
    init(); // start async init
    return fallback.mulAdd(a, b, c);
};

/**
 * Awaitable mulAdd; resolves after WASM init or falls back.
 * @param {number} a
 * @param {number} b
 * @param {number} c
 * @returns {Promise<number>}
 */
export const mulAddAsync = async (a, b, c) => {
    const exp = await init();
    return (exp.mulAdd || fallback.mulAdd)(a, b, c);
};

export const nativeMathReady = () => initPromise || init();
