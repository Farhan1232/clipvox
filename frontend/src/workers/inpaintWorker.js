// Inpainting worker — runs off the main thread so the UI never freezes.
// Algorithm: best-match row/column texture synthesis.
// For each masked row, find the most similar row from outside the mask
// (matched by comparing border pixels) and copy its texture in.
// Same for columns. Blend the two fills based on proximity to each edge.

function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v }

function inpaint(buf, W, H, x0, y0, x1, y1) {
    const px  = new Uint8ClampedArray(buf)   // original pixels (read-only)
    const out = new Uint8ClampedArray(buf)   // output (modified in mask area)

    const fw = x1 - x0
    const fh = y1 - y0
    if (fw <= 0 || fh <= 0) return out.buffer

    // Read a channel value with clamped coords
    const g = (x, y, c) => px[(clamp(y, 0, H-1) * W + clamp(x, 0, W-1)) * 4 + c]

    // ── 1. Row-based fill ──────────────────────────────────────────────────
    // For each masked row ry, find the outside row whose left+right border
    // pixels best match the known border pixels at that y position.
    // Then copy that row's pixels into the filled buffer.

    const rowBuf  = new Uint8ClampedArray(fw * fh * 4)
    const searchH = Math.min(fh * 3, 100)

    for (let ry = 0; ry < fh; ry++) {
        let bestY = (y0 > 0) ? y0 - 1 : y1
        let bestErr = 1e18

        for (let d = 1; d <= searchH; d++) {
            // Try both above and below the mask
            for (const sy of [y0 - d, y1 - 1 + d]) {
                if (sy < 0 || sy >= H) continue

                // Match quality = sum-of-squares of border pixel differences
                let err = 0
                for (let c = 0; c < 3; c++) {
                    const dl = g(x0 - 1, y0 + ry, c) - g(x0 - 1, sy, c)
                    const dr = g(x1,     y0 + ry, c) - g(x1,     sy, c)
                    err += dl * dl + dr * dr
                }
                if (err < bestErr) { bestErr = err; bestY = sy }
                if (err === 0) break  // perfect match — stop early
            }
            if (bestErr === 0) break
        }

        // Copy the best-matched row into rowBuf
        for (let rx = 0; rx < fw; rx++) {
            const di = (ry * fw + rx) * 4
            const si = (bestY * W + x0 + rx) * 4
            rowBuf[di]   = px[si]
            rowBuf[di+1] = px[si+1]
            rowBuf[di+2] = px[si+2]
            rowBuf[di+3] = 255
        }
    }

    // ── 2. Column-based fill ───────────────────────────────────────────────
    const colBuf  = new Uint8ClampedArray(fw * fh * 4)
    const searchW = Math.min(fw * 3, 100)

    for (let rx = 0; rx < fw; rx++) {
        let bestX = (x0 > 0) ? x0 - 1 : x1
        let bestErr = 1e18

        for (let d = 1; d <= searchW; d++) {
            for (const sx of [x0 - d, x1 - 1 + d]) {
                if (sx < 0 || sx >= W) continue

                let err = 0
                for (let c = 0; c < 3; c++) {
                    const dt = g(x0 + rx, y0 - 1, c) - g(sx, y0 - 1, c)
                    const db = g(x0 + rx, y1,     c) - g(sx, y1,     c)
                    err += dt * dt + db * db
                }
                if (err < bestErr) { bestErr = err; bestX = sx }
                if (err === 0) break
            }
            if (bestErr === 0) break
        }

        for (let ry = 0; ry < fh; ry++) {
            const di = (ry * fw + rx) * 4
            const si = ((y0 + ry) * W + bestX) * 4
            colBuf[di]   = px[si]
            colBuf[di+1] = px[si+1]
            colBuf[di+2] = px[si+2]
            colBuf[di+3] = 255
        }
    }

    // ── 3. Blend row + column fills ────────────────────────────────────────
    // Pixels near the top/bottom edges get more row-fill weight.
    // Pixels near the left/right edges get more column-fill weight.
    // This ensures smooth, coherent transitions from every boundary.

    for (let ry = 0; ry < fh; ry++) {
        for (let rx = 0; rx < fw; rx++) {
            // Inverse-distance weight to nearest horizontal vs vertical edge
            const wRow = 1 / (Math.min(ry, fh - 1 - ry) + 1)
            const wCol = 1 / (Math.min(rx, fw - 1 - rx) + 1)
            const tot  = wRow + wCol

            const oi = ((y0 + ry) * W + x0 + rx) * 4
            const bi = (ry * fw + rx) * 4

            for (let c = 0; c < 3; c++) {
                out[oi + c] = Math.round((rowBuf[bi + c] * wRow + colBuf[bi + c] * wCol) / tot)
            }
            out[oi + 3] = 255
        }
    }

    // ── 4. Feather the boundary (1-pixel soft edge) ────────────────────────
    // Blend the outermost ring of filled pixels with their outside neighbor
    // to eliminate any hard seam at the mask boundary.
    const blend = (inner, outer) => Math.round(inner * 0.6 + outer * 0.4)

    for (let rx = x0; rx < x1; rx++) {
        // Top edge
        if (y0 > 0) {
            const oi = (y0 * W + rx) * 4, ni = ((y0-1) * W + rx) * 4
            for (let c = 0; c < 3; c++) out[oi+c] = blend(out[oi+c], px[ni+c])
        }
        // Bottom edge
        if (y1 < H) {
            const oi = ((y1-1) * W + rx) * 4, ni = (y1 * W + rx) * 4
            for (let c = 0; c < 3; c++) out[oi+c] = blend(out[oi+c], px[ni+c])
        }
    }
    for (let ry = y0; ry < y1; ry++) {
        // Left edge
        if (x0 > 0) {
            const oi = (ry * W + x0) * 4, ni = (ry * W + x0-1) * 4
            for (let c = 0; c < 3; c++) out[oi+c] = blend(out[oi+c], px[ni+c])
        }
        // Right edge
        if (x1 < W) {
            const oi = (ry * W + x1-1) * 4, ni = (ry * W + x1) * 4
            for (let c = 0; c < 3; c++) out[oi+c] = blend(out[oi+c], px[ni+c])
        }
    }

    return out.buffer
}

self.onmessage = ({ data: { buf, W, H, x0, y0, x1, y1 } }) => {
    const result = inpaint(buf, W, H, x0, y0, x1, y1)
    // Transfer the buffer back (zero-copy)
    self.postMessage({ buf: result }, [result])
}
