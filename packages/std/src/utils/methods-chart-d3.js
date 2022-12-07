import { scaleOrdinal } from 'd3'

export const createColorScale = domain => {
    return scaleOrdinal()
        .domain(domain)
        .range([
            '#3a65ff',
            '#5eff5a',
            '#ffba69',
            '#8676ff',
            '#02a4ff',
            '#17eb8e',
            '#ff7d4d',
            '#991bfa',
            '#e323ff',
        ])
}
