const WizardStep = require('./WizardStep')
const {appendSelector, prependPolyfills, uuid, isBrowserSide, isServerSide} = require('./Utils')

prependPolyfills()

const DEFAULT_PARAMS = {
    step_selector: '[data-step]',
    prev_step_selector: '[data-prev]',
    next_step_selector: '[data-next]',
    submit_selector: '[type="submit"]',
    active_step_index: 0,
    unique_id_prefix: 'zangdar_form_',
    classes: {
        form: 'zandgar__wizard',
        prev_button: 'zandgar__prev',
        next_button: 'zandgar__next',
        step: 'zandgar__step',
        step_active: 'zandgar__step__active',
    },
    onSubmit: null,
    onStepChange: null,
    onValidation: null,
    customValidation: null
}

class Zangdar {

    /**
     * @param {HTMLFormElement|String} selector
     * @param {Object} options
     */
    constructor(selector, options = {}) {
        this._$form = selector instanceof HTMLFormElement
            ? selector
            : document.querySelector(selector)

        if (this._$form.constructor !== HTMLFormElement)
            throw new Error(`[Err] Zangdar.constructor - the container must be a valid HTML form element`)

        this._params = {
            ...DEFAULT_PARAMS,
            ...options
        }

        this._$prevButtons = null
        this._steps = []
        this._currentIndex = this._params.active_step_index
        this._uuid = this._params.unique_id_prefix + uuid()

        this._bindEventsContext()
        this._init()
    }

    /**
     * Returns current step index
     *
     * @returns {Number}
     */
    get currentIndex() {
        return this._currentIndex
    }

    /**
     * Returns all wizard steps
     *
     * @returns {WizardStep[]}
     */
    get steps() {
        return this._steps
    }

    /**
     * Returns form unique ID
     *
     * @returns {String}
     */
    get uniqueId() {
        return this._uuid
    }

    /**
     * Get a step
     *
     * @param {String|Number} key step index or label
     * @returns {WizardStep|null} WizardStep instance if exists, null otherwise
     */
    getStep(key) {
        if (key.constructor === String)
            return this._steps.find(step => step.labeled(key))

        if (key.constructor === Number)
            return this._steps[key]

        return null
    }

    /**
     * Get wizard HTML form element
     *
     * @returns {HTMLFormElement}
     */
    getFormElement() {
        return this._$form
    }

    /**
     * Get the current step
     *
     * @returns {WizardStep|null} the current WizardStep instance if exists, null otherwise
     */
    getCurrentStep() {
        return this.getStep(this._currentIndex)
    }

    /**
     * Reveal previous step
     *
     * @fluent
     * @returns {Zangdar}
     */
    prev() {
        this._prevStep()

        return this
    }

    /**
     * Reveal next step
     *
     * @fluent
     * @returns {Zangdar}
     */
    next() {
        this._nextStep()

        return this
    }

    /**
     * Go to a step by label (data-step attribute value)
     *
     * @fluent
     * @param {String} label
     * @returns {Zangdar}
     */
    revealStep(label) {
        const index = this._steps.findIndex(step => step.labeled(label))

        if (index !== this._currentIndex) {
            const oldStep = this.getCurrentStep()
            const direction = oldStep.index > index ? -1 : 1

            if (index >= 0) {
                if (direction < 0 || this._validateCurrentStep()) {
                    this._currentIndex = index
                    this._revealStep()
                    this._onStepChange(oldStep, direction)
                }
            } else
                throw new Error(`[Err] Zangdar.revealStep - step "${label}" not found`)
        }

        return this
    }

    /**
     * Create a wizard from an existing form with a template which is describes it
     *
     * @fluent
     * @param {Object} template the wizard template
     * @returns {Zangdar}
     */
    createFromTemplate(template) {
        let i = 0
        for (let label in template) {
            ++i

            if (template.hasOwnProperty(label)) {
                const fields = template[label]
                const $section = this._buildSection(label)
                fields.forEach(field => {
                    const el = this._$form.querySelector(field)

                    if (el !== null) {
                        const newElm = el.cloneNode(true)
                        $section.appendChild(newElm)
                        el.parentNode.removeChild(el)
                    }
                })

                if (i < Object.keys(template).length && $section.querySelector(this._params.next_step_selector) === null) {
                    let $nextButton = document.createElement('button')
                    $nextButton = appendSelector(this._params.next_step_selector, null, $nextButton)
                    $nextButton.innerText = 'Next'
                    $section.appendChild($nextButton)
                }

                if (i === Object.keys(template).length) {
                    const $submitButton = this._$form.querySelector(this._params.submit_selector)

                    if ($submitButton !== null) {
                        const newBtn = $submitButton.cloneNode(true)
                        $section.appendChild(newBtn)
                        $submitButton.parentNode.removeChild($submitButton)
                    }
                }
                this._$form.appendChild($section)
            }
        }

        this._init()

        return this
    }

    /**
     * @returns {Object}
     */
    getBreadcrumb() {
        return this._steps.reduce((acc, step) => {
            acc[step.label] = {
                completed: step.isComplete(),
                active: step.isActive()
            }

            return acc
        }, {})
    }

    /**
     * @private
     */
    _init() {
        if (this._$form.querySelectorAll(this._params.step_selector).length) {
            this._buildForm()
            this._buildPrevButton()
            this._buildSteps()
        }
    }

    /**
     * @private
     */
    _buildForm() {
        let onSubmit = this._params.onSubmit
        this._$form.classList.add(this._params.classes.form)
        this._$form.dataset.wizard = this._uuid

        !this._$form.hasAttribute('name') && (this._$form.setAttribute('name', this._uuid))

        this._$form.addEventListener('submit', e => {
            if (this._validateCurrentStep()) {
                if (onSubmit && onSubmit.constructor === Function)
                    onSubmit(e)
                else e.target.submit()
            }
        })
    }

    /**
     * @private
     */
    _buildPrevButton() {
        this._$prevButtons = this._$form.querySelectorAll(this._params.prev_step_selector)

        if (!this._$prevButtons || !this._$prevButtons.length) {
            const $prevBtn = document.createElement('button')
            $prevBtn.setAttribute('data-prev', '')
            $prevBtn.innerText = 'Prev.'
            this._$form.insertBefore($prevBtn, this._$form.firstChild)
            this._buildPrevButton()
        } else {
            Array.from(this._$prevButtons).forEach(btn => {
                btn.classList.add(this._params.classes.prev_button)
                btn.addEventListener('click', e => {
                    e.preventDefault()
                    this._prevStep()
                })
            })
        }
    }

    /**
     * @private
     */
    _buildSteps() {
        let steps = Array.from(this._$form.querySelectorAll(this._params.step_selector))

        if (!steps.length)
            throw new Error(`[Err] Zangdar._buildSteps - you must have at least one step (a HTML element with "${this._params.step_selector}" attribute)`)

        steps.reduce((acc, item, index) => {
            const label = item.dataset.step
            const isActive = index === this._params.active_step_index
            item.classList.add(this._params.classes.step)

            if (isActive) {
                item.classList.add(this._params.classes.step_active)
                this._currentIndex = index
            }

            if (index < steps.length - 1 && item.querySelector(this._params.next_step_selector)) {
                const $nextButton = item.querySelector(this._params.next_step_selector)

                $nextButton.classList.add(this._params.classes.next_button)
                $nextButton.addEventListener('click', e => {
                    e.preventDefault()
                    if (this._validateCurrentStep())
                        this._nextStep()
                })
            }

            const step = new WizardStep(index, item, label, isActive)

            acc.push(step)

            return acc
        }, this._steps)

        this._currentIndex = this._params.active_step_index
        this._revealStep()
    }

    /**
     * @param {String} label
     * @returns {HTMLElement}
     * @private
     */
    _buildSection(label) {
        let $section = document.createElement('section')

        return appendSelector(this._params.step_selector, label, $section)
    }

    /**
     * @private
     */
    _revealStep() {
        this._steps.forEach((step, i) => {
            this._steps[i].active = step.indexed(this._currentIndex)
            if (step.active)
                step.element.classList.add(this._params.classes.step_active)
            else
                step.element.classList.remove(this._params.classes.step_active)
        })
        this._hidePrevBtns()
    }

    /**
     * @private
     */
    _hidePrevBtns() {
        if (!this._$prevButtons || !this._$prevButtons.length)
            this._buildPrevButton()
        else
            Array.from(this._$prevButtons).forEach(btn => btn.style.display = this._currentIndex === 0 ? 'none' : '')
    }

    /**
     * @private
     */
    _prevStep() {
        const oldStep = this.getCurrentStep()
        oldStep.completed = false
        this._currentIndex = this._currentIndex - 1 < 0 ? 0 : this._currentIndex - 1
        this._revealStep()
        this._onStepChange(oldStep, -1)
    }

    /**
     * @private
     */
    _nextStep() {
        const oldStep = this.getCurrentStep()
        oldStep.completed = true
        this._currentIndex = this._currentIndex < this._steps.length - 1
            ? this._currentIndex + 1
            : this._steps.length
        this._revealStep()
        this._onStepChange(oldStep, 1)
    }

    /**
     * @param {WizardStep} oldStep
     * @param {Number} direction
     * @private
     */
    _onStepChange(oldStep, direction) {
        if (this._params.onStepChange && this._params.onStepChange.constructor === Function)
            this._params.onStepChange(this.getCurrentStep(), oldStep, direction, this._$form)
    }

    /**
     * @private
     */
    _validateCurrentStep() {
        const currentStep = this.getCurrentStep()

        if (this._params.customValidation && this._params.customValidation.constructor === Function) {
            this._$form.setAttribute('novalidate', '')

            return this._params.customValidation(currentStep, currentStep.fields, this._$form)
        }

        this._$form.removeAttribute('novalidate')
        const isValid = currentStep.validate()
        let customValid = true

        if (this._params.onValidation && this._params.onValidation.constructor === Function)
            customValid = this._params.onValidation(currentStep, currentStep.fields, this._$form)

        return isValid && customValid
    }

    _bindEventsContext() {
        ['onSubmit', 'onStepChange', 'onValidation', 'customValidation']
            .forEach(eventName => {
                if (this._params[eventName] && this._params[eventName].constructor === Function)
                    this._params[eventName] = this._params[eventName].bind(this)
            })
    }
}

if (isServerSide)
    module.exports = Zangdar

if (isBrowserSide) {
    !window.hasOwnProperty('Zangdar') && (window.Zangdar = Zangdar)

    if (!HTMLFormElement.prototype.zangdar)
        HTMLFormElement.prototype.zangdar = function (options) {
            return new Zangdar(this, options)
        }
}
