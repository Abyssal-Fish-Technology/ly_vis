module.exports = {
    extends: "stylelint-config-standard",
    rules: {
        indentation: 4,
        "selector-pseudo-class-no-unknown": [true, {
            ignorePseudoClasses: ["global", "local"]
        }],
        "rule-empty-line-before": ['never'],
        "no-descending-specificity": null,
    }
}
