// Minimal placeholder parser scaffold for WASM acceleration.
// This does not build the tree; it only demonstrates how to plumb a C++ entrypoint.
// Build with:
//   emcc fast_parser.cpp -O3 -s STANDALONE_WASM=1 -s EXPORTED_FUNCTIONS='["_count_files"]' -o fast-parser.wasm
// Place the resulting fast-parser.wasm at: _tech/native/fast-parser.wasm

extern "C" {
    // Returns the number of files seen (for demonstration).
    int count_files(int n) {
        return n;
    }
}
