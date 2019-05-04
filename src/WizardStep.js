class WizardStep {

    /**
     * Step index
     *
     * @type {number}
     */
    index

    /**
     * Step HTML element
     *
     * @type {HTMLElement}
     */
    element

    /**
     * Step label
     *
     * @type {String}
     */
    label

    /**
     * Step status
     *
     * @type {boolean}
     */
    active = false

    /**
     * Step completion
     *
     * @type {boolean}
     */
    completed = false

    /**
     * Step errors
     *
     * @type {Object}
     */
    errors = {}

    constructor(index, element, label, active = false) {
        this.index = index
        this.element = element
        this.label = label
        this.active = active
    }

    /**
     * @param {Number} index
     * @returns {boolean}
     */
    indexed(index) {
        return this.index === index
    }

    /**
     * @param {String} label
     * @returns {boolean}
     */
    labeled(label) {
        return this.label === label
    }

    /**
     * Is step active
     *
     * @returns {boolean}
     */
    isActive() {
        return this.active === true
    }

    /**
     * Is step complete
     *
     * @returns {boolean}
     */
    isComplete() {
        return this.completed === true
    }

    /**
     * @returns {Boolean}
     * @returns {Step}
     */
    hasErrors() {
        return Object.keys(this.errors).length > 0
    }

    /**
     * @param {String} field
     * @param {String} value
     */
    addError(field, value) {
        if (!this.errors[field]) this.errors[field] = []
        this.errors[field].push(value)
        return this
    }

    /**
     * @returns {Step}
     */
    clearErrors() {
        this.errors = {}
        return this
    }
}

module.exports = WizardStep
