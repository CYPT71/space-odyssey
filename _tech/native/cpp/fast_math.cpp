// Minimal C++ math helpers for WASM fast-paths.
// Build with emcc (Emscripten):
//   emcc fast_math.cpp -O3 -s STANDALONE_WASM=1 \
//     -s EXPORTED_FUNCTIONS='["_dist3","_lerp","_clamp","_smoothstep","_dot3","_mag3"]' \
//     -o fast-math.wasm
// Place the resulting fast-math.wasm at: _tech/native/fast-math.wasm

#include <cmath>

extern "C" {
    float dist3(float ax, float ay, float az, float bx, float by, float bz) {
        const float dx = ax - bx;
        const float dy = ay - by;
        const float dz = az - bz;
        return sqrtf(dx * dx + dy * dy + dz * dz);
    }

    float lerp(float a, float b, float t) {
        if (t < 0.0f) t = 0.0f;
        if (t > 1.0f) t = 1.0f;
        return a + (b - a) * t;
    }

    float clamp(float v, float lo, float hi) {
        return v < lo ? lo : (v > hi ? hi : v);
    }

    float smoothstep(float edge0, float edge1, float x) {
        float t = (x - edge0) / (edge1 - edge0);
        t = clamp(t, 0.0f, 1.0f);
        return t * t * (3.0f - 2.0f * t);
    }

    float dot3(float ax, float ay, float az, float bx, float by, float bz) {
        return ax * bx + ay * by + az * bz;
    }

    float mag3(float ax, float ay, float az) {
        return sqrtf(ax * ax + ay * ay + az * az);
    }
}
