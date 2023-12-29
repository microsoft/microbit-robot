#! /usr/bin/env node

// Computes the convex hull of the given image.

const commander = require("commander")
const getPixels = require("get-pixels")
const simplify = require("simplify-js")

commander
    .usage("[options]")
    .option("-i, --image <path>", "Input image path or URL")
    .option("-s, --scale <value>", "Scale factor", parseFloat, 1)
    .parse()

const options = commander.opts()

const imagePath = options.image
const scale = options.scale

if (!imagePath) {
    console.error("Input image not specified")
    commander.help()
    process.exit(1)
}

console.log(`Reading image from ${imagePath}...`)
getPixels(imagePath, (err, pixels) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }

    console.warn("Computing hull...")
    const imgWidth = pixels.shape[0]
    const imgHalfWidth = imgWidth >> 1
    const imgHeight = pixels.shape[1]
    const imgHalfHeight = imgHeight >> 1
    console.warn(`Image size: ${imgWidth}x${imgHeight}`)
    console.warn(`Scale: ${scale}`)

    // Find the first and last non-transparent pixel in each row
    console.warn("Finding markers...")
    const markers = []
    for (let y = 0; y < imgHeight; y++) {
        let first = -1,
            last = -1
        for (let x = 0; x < imgWidth; x++) {
            const a = pixels.get(x, y, 3)
            if (a > 0) {
                if (first < 0) first = x
                last = x
            }
        }
        if (first < 0) first = 0
        if (last < 0) last = imgWidth - 1
        markers.push([first, last])
    }
    // Convert markers to polygon vertices
    const verts = []
    for (let y = 0; y < imgHeight; y++) {
        const [first, last] = markers[y]
        verts.push({ x: first, y })
    }
    for (let y = imgHeight - 1; y >= 0; y--) {
        const [first, last] = markers[y]
        verts.push({ x: last, y })
    }
    console.warn(`\t${verts.length} vertices`)

    // Get the convex hull
    console.warn("Computing convex hull...")
    const hull = convexHull(verts)
    console.warn(`\t${hull.length} vertices`)

    // Simplify the polygon
    console.warn("Simplifying hull...")
    const tolerance = 1
    const simplified = simplify(hull, tolerance, false)
    console.warn(`\t${simplified.length} vertices`)

    // Scale the hull
    console.warn("Scaling hull...")
    const scaledHull = simplified.map(({ x, y }) => ({
        x: (scale * (x - imgHalfWidth)) / imgWidth,
        y: (scale * (y - imgHalfHeight)) / imgHeight,
    }))
    console.log(JSON.stringify(scaledHull))

    console.warn("Done.")
})

const Orientation = {
    Collinear: 0,
    Clockwise: 1,
    CounterClockwise: 2,
}

function orientation(p, q, r) {
    const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y)

    if (val == 0) return Orientation.Collinear
    return val > 0 ? Orientation.Clockwise : Orientation.CounterClockwise
}

function convexHull(verts) {
    const n = verts.length
    if (n < 3) return []

    const hull = []

    let iLeftmost = 0
    for (let i = 1; i < n; i++) {
        if (verts[i].x < verts[iLeftmost].x) iLeftmost = i
    }

    let p = iLeftmost,
        q = 0
    do {
        hull.push(verts[p])
        q = (p + 1) % n
        for (let i = 0; i < n; i++) {
            if (
                orientation(verts[p], verts[i], verts[q]) ===
                Orientation.CounterClockwise
            ) {
                q = i
            }
        }
        p = q
    } while (p != iLeftmost)

    return hull
}
