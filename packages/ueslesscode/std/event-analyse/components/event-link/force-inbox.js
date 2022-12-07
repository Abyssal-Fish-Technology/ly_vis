/* eslint-disable */
import * as d3 from 'd3'

export default function forceInABox(alpha) {
    function index(d) {
        return d.index
    }

    let id = index
    let nodes
    let links // needed for the force version
    let tree
    let size = [100, 100]
    let nodeSize = 1 // The expected node size used for computing the cluster node
    let forceCharge = -2
    const foci = {}
    // oldStart = force.start,
    let linkStrengthIntraCluster = 0.1
    let linkStrengthInterCluster = 0.01
    // oldGravity = force.gravity(),
    let templateNodes = []
    let offset = [0, 0]
    let templateForce
    let templateNodesSel
    let groupBy = function (d) {
        return d.cluster
    }
    let template = 'treemap'
    let enableGrouping = true
    let strength = 0.1
    // showingTemplate = false;

    function force(alpha) {
        if (!enableGrouping) {
            return force
        }
        if (template === 'force') {
            // Do the tick of the template force and get the new focis
            templateForce.tick()
            getFocisFromTemplate()
        }

        for (
            var i = 0, n = nodes.length, node, k = alpha * strength;
            i < n;
            ++i
        ) {
            node = nodes[i]
            node.vx += (foci[groupBy(node)].x - node.x) * k
            node.vy += (foci[groupBy(node)].y - node.y) * k
        }
    }

    function initialize() {
        if (!nodes) return

        // var i,
        //     n = nodes.length,
        //     m = links.length,
        //     nodeById = map(nodes, id),
        //     link;

        if (template === 'treemap') {
            initializeWithTreemap()
        } else {
            initializeWithForce()
        }
    }

    force.initialize = function (_) {
        nodes = _
        initialize()
    }

    function getLinkKey(l) {
        const sourceID = groupBy(l.source)
        const targetID = groupBy(l.target)
        return sourceID <= targetID
            ? `${sourceID}~${targetID}`
            : `${targetID}~${sourceID}`
    }

    function computeClustersNodeCounts(nodes) {
        const clustersCounts = d3.map()
        nodes.forEach(function (d) {
            if (!clustersCounts.has(groupBy(d))) {
                clustersCounts.set(groupBy(d), 0)
            }
        })

        nodes.forEach(function (d) {
            // if (!d.show) { return; }
            clustersCounts.set(groupBy(d), clustersCounts.get(groupBy(d)) + 1)
        })

        return clustersCounts
    }

    // Returns
    function computeClustersLinkCounts(links) {
        const dClusterLinks = d3.map()
        const clusterLinks = []
        links.forEach(function (l) {
            const key = getLinkKey(l)
            let count
            if (dClusterLinks.has(key)) {
                count = dClusterLinks.get(key)
            } else {
                count = 0
            }
            count += 1
            dClusterLinks.set(key, count)
        })

        dClusterLinks.entries().forEach(function (d) {
            let source
            let target
            source = d.key.split('~')[0]
            target = d.key.split('~')[1]
            clusterLinks.push({
                source,
                target,
                count: d.value,
            })
        })
        return clusterLinks
    }

    // Returns the metagraph of the clusters
    function getGroupsGraph() {
        const gnodes = []
        const glinks = []
        // edges = [],
        const dNodes = d3.map()
        // totalSize = 0,
        let clustersList
        let c
        let i
        let size
        let clustersCounts
        let clustersLinks

        clustersCounts = computeClustersNodeCounts(nodes)
        clustersLinks = computeClustersLinkCounts(links)

        // map.keys() is really slow, it's crucial to have it outside the loop
        clustersList = clustersCounts.keys()
        for (i = 0; i < clustersList.length; i += 1) {
            c = clustersList[i]
            size = clustersCounts.get(c)
            gnodes.push({ id: c, size })
            dNodes.set(c, i)
            // totalSize += size;
        }

        clustersLinks.forEach(function (l) {
            glinks.push({
                source: dNodes.get(l.source),
                target: dNodes.get(l.target),
                count: l.count,
            })
        })

        return { nodes: gnodes, links: glinks }
    }

    function getGroupsTree() {
        const children = []
        let totalSize = 0
        let clustersList
        let c
        let i
        let size
        let clustersCounts
        clustersCounts = computeClustersNodeCounts(force.nodes())

        const sizeScale = d3.scaleLinear()
            .domain([0, d3.max(clustersCounts.values())])
            .range([1, 10])

        // map.keys() is really slow, it's crucial to have it outside the loop
        clustersList = clustersCounts.keys()
        for (i = 0; i < clustersList.length; i += 1) {
            c = clustersList[i]
            size = sizeScale(clustersCounts.get(c))
            children.push({ id: c, size })
            totalSize += size
        }
        // return {id: "clustersTree", size: totalSize, children : children};
        return { id: 'clustersTree', children }
    }

    function getFocisFromTemplate() {
        // compute foci
        foci.none = { x: 0, y: 0 }
        templateNodes.forEach(function (d) {
            if (template === 'treemap') {
                foci[d.data.id] = {
                    x: d.x0 + (d.x1 - d.x0) / 2 - offset[0],
                    y: d.y0 + (d.y1 - d.y0) / 2 - offset[1],
                }
            } else {
                foci[d.id] = { x: d.x - offset[0], y: d.y - offset[1] }
            }
        })
    }
    function initializeWithTreemap() {
        const treemap = d3.treemap().size(force.size())
        tree = d3
            .hierarchy(getGroupsTree())
            // .sort(function (p, q) { return d3.ascending(p.size, q.size); })
            // .count()
            .sum(function (d) {
                return d.size
            })
            .sort(function (a, b) {
                return b.height - a.height || b.value - a.value
            })

        templateNodes = treemap(tree).leaves()

        getFocisFromTemplate()
    }

    function checkLinksAsObjects() {
        // Check if links come in the format of indexes instead of objects
        let linkCount = 0
        if (nodes.length === 0) return

        links.forEach(function (link) {
            let source
            let target
            if (!nodes) return
            source = link.source
            target = link.target
            if (typeof link.source !== 'object') source = nodes[link.source]
            if (typeof link.target !== 'object') target = nodes[link.target]
            if (source === undefined || target === undefined) {
                console.log(link)
                throw Error(
                    "Error setting links, couldn't find nodes for a link (see it on the console)"
                )
            }
            link.source = source
            link.target = target
            link.index = linkCount++
        })
    }

    function initializeWithForce() {
        let net

        if (nodes && nodes.length > 0) {
            if (groupBy(nodes[0]) === undefined) {
                throw Error(
                    "Couldn't find the grouping attribute for the nodes. Make sure to set it up with forceInABox.groupBy('attr') before calling .links()"
                )
            }
        }

        checkLinksAsObjects()

        net = getGroupsGraph()
        templateForce = d3
            .forceSimulation(net.nodes)
            .force('x', d3.forceX(size[0] / 2).strength(0.5))
            .force('y', d3.forceY(size[1] / 2).strength(0.5))
            .force(
                'collide',
                d3.forceCollide(function (d) {
                    return d.size * nodeSize
                })
            )
            .force(
                'charge',
                d3.forceManyBody().strength(function (d) {
                    return forceCharge * d.size
                })
            )
            .force('links', d3.forceLink(!net.nodes ? net.links : []))

        templateNodes = templateForce.nodes()

        getFocisFromTemplate()
    }
    const color = d3.scaleOrdinal(d3.range(9), d3.schemeCategory10)
    function drawTreemap(container) {
        container.selectAll('.cell').remove()
        const item = container
            .selectAll('cell')
            .data(templateNodes)
            .enter()
            .append('svg:g')
            .classed('cell', true)
            .attr('transform', d => `translate(${d.x0}, ${d.y0})`)

        item.append('text')
            .classed('cellName', true)
            .attr('dy', '2em')
            .attr('dx', '1em')
            .text(d => d.data.id)
        item.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', function (d) {
                return d.x1 - d.x0
            })
            .attr('height', function (d) {
                return d.y1 - d.y0
            })
            .attr('fill', (d, i) => color(d.data.id))
            .attr('stroke', (d, i) => color(d.data.id))
    }

    function drawGraph(container) {
        container.selectAll('.cell').remove()
        templateNodesSel = container.selectAll('cell').data(templateNodes)
        templateNodesSel
            .enter()
            .append('svg:circle')
            .attr('class', 'cell')
            .attr('cx', function (d) {
                return d.x
            })
            .attr('cy', function (d) {
                return d.y
            })
            .attr('r', function (d) {
                return d.size * nodeSize
            })
    }

    force.drawTemplate = function (container) {
        // showingTemplate = true;
        if (template === 'treemap') {
            drawTreemap(container)
        } else {
            drawGraph(container)
        }
        return force
    }

    // Backwards compatibility
    force.drawTreemap = force.drawTemplate

    force.deleteTemplate = function (container) {
        // showingTemplate = false;
        container.selectAll('.cell').remove()

        return force
    }

    force.template = function (x) {
        if (!arguments.length) return template
        template = x
        initialize()
        return force
    }

    force.groupBy = function (x) {
        if (!arguments.length) return groupBy
        if (typeof x === 'string') {
            groupBy = function (d) {
                return d[x]
            }
            return force
        }
        groupBy = x
        return force
    }

    force.enableGrouping = function (x) {
        if (!arguments.length) return enableGrouping
        enableGrouping = x
        // update();
        return force
    }

    force.strength = function (x) {
        if (!arguments.length) return strength
        strength = x
        return force
    }

    force.getLinkStrength = function (e) {
        if (enableGrouping) {
            if (groupBy(e.source) === groupBy(e.target)) {
                if (typeof linkStrengthIntraCluster === 'function') {
                    return linkStrengthIntraCluster(e)
                }
                return linkStrengthIntraCluster
            }
            if (typeof linkStrengthInterCluster === 'function') {
                return linkStrengthInterCluster(e)
            }
            return linkStrengthInterCluster
        }
        // Not grouping return the intracluster
        if (typeof linkStrengthIntraCluster === 'function') {
            return linkStrengthIntraCluster(e)
        }
        return linkStrengthIntraCluster
    }

    force.id = function (_) {
        return arguments.length ? ((id = _), force) : id
    }

    force.size = function (_) {
        return arguments.length ? ((size = _), force) : size
    }

    force.linkStrengthInterCluster = function (_) {
        return arguments.length
            ? ((linkStrengthInterCluster = _), force)
            : linkStrengthInterCluster
    }

    force.linkStrengthIntraCluster = function (_) {
        return arguments.length
            ? ((linkStrengthIntraCluster = _), force)
            : linkStrengthIntraCluster
    }

    force.nodes = function (_) {
        return arguments.length ? ((nodes = _), force) : nodes
    }

    force.links = function (_) {
        if (!arguments.length) return links
        if (_ === null) links = []
        else links = _
        return force
    }

    force.nodeSize = function (_) {
        return arguments.length ? ((nodeSize = _), force) : nodeSize
    }

    force.forceCharge = function (_) {
        return arguments.length ? ((forceCharge = _), force) : forceCharge
    }

    force.offset = function (_) {
        return arguments.length ? ((offset = _), force) : offset
    }

    return force
}
