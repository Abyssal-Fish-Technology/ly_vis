const RequestStore = {
    arr: [],
    featureArr: [],
    tooltipArr: [],
    add(cancel) {
        this.arr.push(cancel)
    },
    cancel() {
        this.arr.forEach(d => d())
        this.arr = []
    },
    tooltipAdd(cancel) {
        this.tooltipArr.push(cancel)
    },
    tooltipCancel() {
        this.tooltipArr.forEach(d => d())
        this.tooltipArr = []
    },
}
export default RequestStore
