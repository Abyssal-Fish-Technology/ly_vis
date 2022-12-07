/* eslint-disable */
import {
    select,
    voronoi,
    extent,
    polygonContains,
    curveBasis,
    line,
    sum,
} from 'd3'
import Graph from 'node-dijkstra'
import simplifyJS from 'simplify-js'

function fitnessFunction(path, length, strategy) {
    let fitness = length
    if (strategy !== 'longest') {
        const sinuosity =
            length / distanceBetween(path[0], path[path.length - 1])

        // divide the length by some power of the sinuosity
        // these choices are arbitrary, play with them!
        fitness /= Math.pow(sinuosity, strategy === 'medium' ? 2 : 4)
    }
    return fitness
}

function findClosestPolygonIntersection(start, end, polygon) {
    return polygon.reduce((best, point, i) => {
        const intersection = findIntersection(
            start,
            end,
            point,
            polygon[i + 1] || polygon[0]
        )
        if (intersection) {
            const distance = distanceBetween(start, intersection)
            if (!best.distance || distance < best.distance) {
                return { intersection, distance }
            }
        }
        return best
    }, {})
}

function getPointsAlongPolyline(polyline, count) {
    const distances = polyline.map((p, i) =>
        distanceBetween(p, polyline[i + 1] || polyline[0])
    )
    const totalLength = sum(distances)
    const step = totalLength / count
    let traversed = 0
    let next = step / 2

    const done = polyline.reduce((arr, point, i) => {
        while (next < traversed + distances[i]) {
            const a = point
            const b = polyline[i + 1] || polyline[0]
            const pct = (next - traversed) / distances[i]
            arr.push([a[0] + (b[0] - a[0]) * pct, a[1] + (b[1] - a[1]) * pct])
            next += step
        }
        traversed += distances[i]
        return arr
    }, [])
    return done
}

function findIntersection(a1, a2, b1, b2) {
    // Adapted from https://github.com/Turfjs/turf-line-slice-at-intersection
    const uaT =
        (b2[0] - b1[0]) * (a1[1] - b1[1]) - (b2[1] - b1[1]) * (a1[0] - b1[0])
    const ubT =
        (a2[0] - a1[0]) * (a1[1] - b1[1]) - (a2[1] - a1[1]) * (a1[0] - b1[0])
    const uB =
        (b2[1] - b1[1]) * (a2[0] - a1[0]) - (b2[0] - b1[0]) * (a2[1] - a1[1])

    if (uB !== 0) {
        const ua = uaT / uB
        const ub = ubT / uB
        if (ua > 0 && ua < 1 && ub > 0 && ub < 1) {
            return [a1[0] + ua * (a2[0] - a1[0]), a1[1] + ua * (a2[1] - a1[1])]
        }
    }
}

function rotatePoint(point, angle, center) {
    const x2 =
        (point[0] - center[0]) * Math.cos(angle) -
        (point[1] - center[1]) * Math.sin(angle)
    const y2 =
        (point[0] - center[0]) * Math.sin(angle) +
        (point[1] - center[1]) * Math.cos(angle)

    return [
        (point[0] - center[0]) * Math.cos(angle) -
            (point[1] - center[1]) * Math.sin(angle) +
            center[0],
        (point[0] - center[0]) * Math.sin(angle) +
            (point[1] - center[1]) * Math.cos(angle) +
            center[1],
    ]
}

function tangentAt(el, len) {
    const [a, b] = [
        el.getPointAtLength(Math.max(len - 0.01, 0)),
        el.getPointAtLength(len + 0.01),
    ]

    return Math.atan2(b.y - a.y, b.x - a.x)
}

function simplify(points, simplification) {
    // Convert from [x, y] to { x, y } and back for simplify-js
    return simplifyJS(
        points.map(p => ({ x: p[0], y: p[1] })),
        simplification
    ).map(p => [p.x, p.y])
}

function distanceBetween(a, b) {
    const dx = a[0] - b[0]
    const dy = a[1] - b[1]

    return Math.sqrt(dx * dx + dy * dy)
}

function computeBbox(label) {
    const text = select('text#centerlabel')
        .attr('class', 'label')
        .style('font-size', '100px')
        .text(label)
        .node()
    const boundingBox = text.getBBox()
    return boundingBox
}

function computeMeasurements(polygon, centerline, offset, measurementStep) {
    // const path = select(svg).append('path').attr('d', centerline).node()
    const path = select('path#center').attr('d', centerline).node()

    const length = path.getTotalLength()

    const measurements = []

    for (
        let halfwidth = 0;
        halfwidth < Math.min(length * offset, length * (1 - offset));
        halfwidth += measurementStep
    ) {
        measurements.push(
            [length * offset + halfwidth, length * offset - halfwidth]
                .map(l => {
                    const { x, y } = path.getPointAtLength(l)
                    const tangent = tangentAt(path, l)
                    const perpendiculars = [
                        tangent - Math.PI / 2,
                        tangent + Math.PI / 2,
                    ]
                        .map(angle =>
                            findClosestPolygonIntersection(
                                [x, y],
                                rotatePoint([x + 100, y], angle, [x, y]),
                                polygon
                            )
                        )
                        .filter(d => d.intersection)
                        .sort((a, b) => a.distance - b.distance)

                    if (!perpendiculars.length) {
                        return null
                    }

                    const { intersection, distance } = perpendiculars[0]

                    const lines = [
                        intersection,
                        [2 * x - intersection[0], 2 * y - intersection[1]],
                    ]

                    lines.distance = distance

                    return lines
                })
                .filter(d => d)
        )
    }

    return measurements
}

function computeMaxFontSize(label, measurements, measurementStep) {
    const bbox = computeBbox(label)
    const widthPerPixel = bbox.width / 100
    const aspectRatio = bbox.width / bbox.height
    let ceiling = Infinity
    let maxWidth = 0

    measurements.forEach((pair, i) => {
        pair.forEach(measurement => {
            ceiling = Math.min(measurement.distance, ceiling)
        })
        maxWidth = Math.max(
            maxWidth,
            2 * Math.min(i * measurementStep, ceiling * aspectRatio)
        )
    })

    return maxWidth / widthPerPixel
}

function computeCenterline(path, simplification) {
    const simplifiedLine = simplify(path, simplification)
    const flipText = computeFlip(simplifiedLine)

    return line().curve(curveBasis)(
        flipText ? simplifiedLine.slice(0).reverse() : simplifiedLine
    )
}

function computeFlip(simplifiedLine) {
    const [[x0, y0], [x1, y1]] = [
        simplifiedLine[0],
        simplifiedLine[simplifiedLine.length - 1],
    ]
    const tangent = Math.atan2(y1 - y0, x1 - x0)
    return Math.abs(tangent) > Math.PI / 2
}

function computeTraversal(nodes, strategy) {
    const perimeterNodes = nodes.filter(d => d.clipped)
    const graph = new Graph()
    nodes.forEach(node => graph.addNode(node.id, node.links))

    let totalBest

    for (let i = 0; i < perimeterNodes.length; i += 1) {
        const start = perimeterNodes[i]
        const longestShortestPath = perimeterNodes
            .slice(i + 1)
            .reduce((nodeBest, node) => {
                const path = graph.path(node.id, start.id, { cost: true })
                if (path && (!nodeBest || path.cost > nodeBest.cost)) {
                    return path
                }
                return nodeBest
            }, null)

        if (longestShortestPath && longestShortestPath.path) {
            longestShortestPath.path = longestShortestPath.path.map(
                id => nodes[+id]
            )
            longestShortestPath.cost = fitnessFunction(
                longestShortestPath.path,
                longestShortestPath.cost,
                strategy
            )
            if (!totalBest || longestShortestPath.cost > totalBest.cost) {
                totalBest = longestShortestPath
            }
        }
    }

    return totalBest.path
}

function computeNodes(edges) {
    const nodes = []

    edges.forEach(edge => {
        edge.forEach((node, i) => {
            if (!i || !node.clipped) {
                const match = nodes.find(d => d === node)
                if (match) {
                    return (node.id = match.id)
                }
            }
            node.id = nodes.length.toString()
            node.links = {}
            nodes.push(node)
        })
        edge[0].links[edge[1].id] = edge.distance
        edge[1].links[edge[0].id] = edge.distance
    })

    return nodes
}

function computeEdges(voronois, polygon) {
    return voronois
        .filter(edge => {
            if (edge && edge.right) {
                const inside = edge.map(point =>
                    polygonContains(polygon, point)
                )
                if (inside[0] === inside[1]) {
                    return inside[0]
                }
                if (inside[1]) {
                    edge.reverse()
                }
                return true
            }
            return false
        })
        .map(([start, end] = []) => {
            const { intersection, distance } = findClosestPolygonIntersection(
                start,
                end,
                polygon
            )

            if (intersection) {
                intersection.clipped = true
            }

            // Each edge has a starting point, a clipped end point, and an original end point
            const edge = [start, intersection || end]
            edge.distance = intersection
                ? distance
                : distanceBetween(start, end)

            return edge
        })
}

function computeVoronoi(polygon) {
    const [x0, x1] = extent(polygon.map(d => d[0]))
    const [y0, y1] = extent(polygon.map(d => d[1]))
    const v = voronoi().extent([
        [x0 - 1, y0 - 1],
        [x1 + 1, y1 + 1],
    ])
    return v(polygon).edges
}

function computeOuterRing(projection, feature) {
    const s = projection.scale()
    const t = projection.translate()

    return feature.geometry.coordinates[0][0]
        .slice(1)
        .map(point => [s * point[0] + t[0], s * point[1] + t[1]])
}

export const computeCenterlineLabel = ({
    label,
    polygon,
    numPerimeterPoints = 20, // 10 - 200
    measurementStep = 5, // 1 - 25
    offset = 0.5, // 0 - 1
    simplification = 10, // 0.1 - 50
    strategy = 'medium',
    // strategy can be one of:
    //
    //   "longest" - Just take the longest one"
    //   "medium" - Care a little about straightness
    //   "high" - Care a lot about straightness
} = {}) => {
    const simplifiedPolygon = getPointsAlongPolyline(
        polygon,
        numPerimeterPoints
    )
    const voronois = computeVoronoi(simplifiedPolygon)
    const edges = computeEdges(voronois, polygon)
    const nodes = computeNodes(edges)
    const traversal = computeTraversal(nodes, strategy)
    const centerline = computeCenterline(traversal, simplification)
    const measurements = computeMeasurements(
        simplifiedPolygon,
        centerline,
        offset,
        measurementStep
    )
    const maxFontSize = computeMaxFontSize(label, measurements, measurementStep)

    return { simplifiedPolygon, centerline, offset, label, maxFontSize }
}
