const {getFormElements} = require('./Utils')

class WizardStep {

    /**
     * @public
     * @type {number}
     */
    index = 0

    /**
     * @public
     * @type {HTMLElement}
     */
    element = null

    /**
     * @public
     * @type {string}
     */
    label = ''

    /**
     * @public
     * @type {Boolean}
     */
    active = false

    /**
     * @public
     * @type {Boolean}
     */
    last = false

    /**
     * @private
     * @type {Boolean}
     */
    _completed = false

    /**
     * @private
     * @type {Object}
     */
    _errors = {}

    /**
     * @private
     * @type {Object}
     */
    _fields = {}

    /**
     * @param {Number} index
     * @param {HTMLElement} element
     * @param {String} label
     * @param {Boolean} active
     * @param {Boolean} last
     */
    constructor(index, element, label, active = false, last = false) {
        this.index = index
        this.element = element
        this.label = label
        this.active = active
        this.last = last
        this._completed = false
        this._errors = {}
        this._fields = {}

        this._setFields()
    }

    get completed() {
        return this._completed
    }

    /**
     * @fluent
     * @param {Boolean} state
     * @return {WizardStep}
     */
    set completed(state) {
        this._completed = state

        return this
    }

    get fields() {
        return this._fields
    }

    get errors() {
        return this._errors
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
     * Is first step (based on index)
     *
     * @returns {boolean}
     */
    isFirst() {
        return this.index === 0;
    }

    /**
     * Is last step
     *
     * @returns {boolean}
     */
    isLast() {
        return this.last === true;
    }

    /**
     * Validate a step (HTML5 native validation)
     *
     * @return {boolean}
     */
    validate() {
        this.clearErrors()
        let isValid = true

        Object.values(this._fields)
            .reverse()
            .forEach(el => {
                if (!el.checkValidity()) {
                    isValid = false
                    this.addError(el.name, el.validationMessage)
                    el.reportValidity()
                }
            })

        return isValid
    }

    /**
     * @returns {Boolean}
     */
    hasErrors() {
        return Object.keys(this._errors).length > 0
    }

    /**
     * @param {String} field
     * @param {String} value
     */
    addError(field, value) {
        if (!this._errors[field]) this._errors[field] = []

        this._errors[field].push(value)

        return this
    }

    /**
     * @returns {WizardStep}
     */
    clearErrors() {
        this._errors = {}

        return this
    }

    /**
     * Removes the HTMLElement from the DOM
     */
    removeElement() {
        if (this.element.parentNode)
            this.element.parentNode.removeChild(this.element)
    }

    /**
     * @private
     */
    _setFields() {
        this._fields = getFormElements(this.element, true)
            .reduce((acc, field) => {
                const name = field.getAttribute('name')
                if (name)
                    return {...acc, ...{[name]: field}}

                return acc
            }, {})
    }
}

module.exports = WizardStep
