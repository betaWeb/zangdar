class Zangdar {

    /**
     * @type {HTMLFormElement}
     */
    $form = null

    /**
     *
     * @type {NodeListOf|null}
     * @private
     */
    _$prevButtons = null

    /**
     *
     * @type {Array}
     * @private
     */
    _steps = []

    /**
     *
     * @type {Number|null}
     * @private
     */
    _currentIndex = null


    /**
     * @type {Object}
     * @type {{step_selector: string, prev_step_selector: string, onStepChange(Object, Object): void, active_step_index: number, onSubmit(Event): boolean, classes: {prev_button: string, next_button: string, form: string, step: string, step_active: string}, next_step_selector: string, customValidation: (function(Object, NodeList): boolean), onValidation(Object, NodeList): void}}
     * @private
     */
    _params = {
        step_selector: '[data-step]',
        prev_step_selector: '[data-prev]',
        next_step_selector: '[data-next]',
        submit_selector: '[type="submit"]',
        active_step_index: 0,
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

    /**
     * @param {HTMLFormElement|String} element
     * @param {Object} options
     */
    constructor(element, options = {}) {
        this.$form = element instanceof HTMLFormElement
            ? element
            : document.querySelector(element)

        if (this.$form.constructor !== HTMLFormElement)
            throw new Error(`[Err] Zangdar.constructor - the container must be a valid HTML form element`)

        this._params = {
            ...this._params,
            ...options
        }

        this._init()
    }

    /**
     * Get step by his index
     *
     * @param {Number} index
     * @returns {Object|null}
     */
    get(index = this._currentIndex) {
        return this._steps[index] || null
    }

    /**
     * Reveal previous step
     */
    prev() {
        this._prevStep()
    }

    /**
     * Reveal next step
     */
    next() {
        this._nextStep()
    }

    /**
     * Go to a step by label (data-step attribute value)
     *
     * @param {String} label
     */
    revealStep(label) {
        const index = this._steps.findIndex(step => step.label === label)
        if (index >= 0) {
            this._revealStep()
        }
        throw new Error(`[Err] Zangdar.revealStep - step "${label}" not found`)
    }

    /**
     * Create a wizard from an existing form with a template which is describes it
     *
     * @param {Object} template the wizard template
     */
    createFromTemplate(template) {
        let i = 0
        for (let label in template) {
            ++i
            if (template.hasOwnProperty(label)) {
                const fields = template[label]
                const $section = this._buildSection(label)
                fields.forEach(field => {
                    const el = this.$form.querySelector(field)
                    if (el !== null) {
                        const newElm = el.cloneNode(true)
                        $section.appendChild(newElm)
                        el.parentNode.removeChild(el)
                    }
                })
                if (i < Object.keys(template).length && $section.querySelector(this._params.next_step_selector) === null) {
                    const $nextButton = document.createElement('button')
                    $nextButton.setAttribute(this._params.next_step_selector.replace(/\[|\]/ig, ''), '')
                    $nextButton.innerText = 'Next'
                    $section.appendChild($nextButton)
                }
                if (i === Object.keys(template).length) {
                    const $submitButton = this.$form.querySelector(this._params.submit_selector)
                    if ($submitButton !== null) {
                        const newBtn = $submitButton.cloneNode(true)
                        $section.appendChild(newBtn)
                        $submitButton.parentNode.removeChild($submitButton)
                    }
                }
                this.$form.appendChild($section)
            }
        }
        this._init()
    }

    /**
     * Get the current step
     *
     * @returns {Object|null} the current step if exists, null otherwise
     */
    getCurrentStep() {
        return this.get()
    }

    _init() {
        if (this.$form.querySelectorAll(this._params.step_selector).length) {
            this._buildForm()
            this._buildPrevButton()
            this._buildSteps()
        }
    }

    _buildForm() {
        const onSubmit = this._params.onSubmit
        this.$form.classList.add(this._params.classes.form)
        this.$form.addEventListener('submit', e => {
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
        this._$prevButtons = this.$form.querySelectorAll(this._params.prev_step_selector)

        if (!this._$prevButtons || !this._$prevButtons.length) {
            const $prevBtn = document.createElement('button')
            $prevBtn.setAttribute('data-prev', '')
            $prevBtn.innerText = 'Prev.'
            this.$form.insertBefore($prevBtn, this.$form.firstChild)
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
        let steps = Array.from(this.$form.querySelectorAll(this._params.step_selector))

        if (!steps.length)
            throw new Error(`[Err] Zangdar._buildSteps - you must have at least one step (a HTML element with "${this._params.step_selector}" attribute)`)

        steps.reduce((acc, item, index) => {
            const step = item.dataset.step
            item.classList.add(this._params.classes.step)
            if (index === this._params.active_step_index) {
                item.classList.add(this._params.classes.step_active)
                this._currentIndex = index
            }

            if (index < steps.length - 1 && !item.querySelector(this._params.next_step_selector))
                throw new Error(`[Err] Zangdar._buildSteps - step "${step}" - you must have a next button (with "${this._params.next_step_selector}" attribute") on this step`)

            if (index < steps.length - 1 && item.querySelector(this._params.next_step_selector)) {
                const $nextButton = item.querySelector(this._params.next_step_selector)

                $nextButton.classList.add(this._params.classes.next_button)
                $nextButton.addEventListener('click', e => {
                    e.preventDefault()
                    if (this._validateCurrentStep())
                        this._nextStep()
                })
            }

            acc.push({
                el: item,
                label: step,
                active: false,
                errors: {}
            })
            return acc
        }, this._steps)

        this._currentIndex = this._params.active_step_index
        this._revealStep()
    }

    _buildSection(label) {
        const $section = document.createElement('section')
        $section.setAttribute(this._params.step_selector.replace(/\[|\]/ig, ''), label)
        return $section
    }

    /**
     * @private
     */
    _revealStep() {
        this._steps.forEach((step, i) => {
            step.active = this._currentIndex === i
            if (step.active) {
                step.el.classList.add(this._params.classes.step_active)
            } else {
                step.el.classList.remove(this._params.classes.step_active)
            }
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
        this._currentIndex = this._currentIndex - 1 < 0 ? 0 : this._currentIndex - 1
        if (this._params.onStepChange && this._params.onStepChange.constructor === Function)
            this._params.onStepChange(this.getCurrentStep(), oldStep, -1, this.$form)
        this._revealStep()
    }

    /**
     * @private
     */
    _nextStep() {
        const oldStep = this.getCurrentStep()
        this._currentIndex = this._currentIndex < this._steps.length - 1
            ? this._currentIndex + 1
            : this._steps.length
        if (this._params.onStepChange && this._params.onStepChange.constructor === Function)
            this._params.onStepChange(this.getCurrentStep(), oldStep, 1, this.$form)
        this._revealStep()
    }

    /**
     * @private
     */
    _validateCurrentStep() {
        const currentStep = this._steps[this._currentIndex]
        const fields = this._formElements(currentStep.el)
        if (this._params.customValidation && this._params.customValidation.constructor === Function) {
            this.$form.setAttribute('novalidate', '')
            return this._params.customValidation(currentStep, fields, this.$form)
        }
        this.$form.removeAttribute('novalidate')
        currentStep.errors = {}
        let isValid = true
        Array.from(fields)
            .reverse()
            .forEach(el => {
                if (!el.checkValidity()) {
                    isValid = false
                    if (!currentStep.errors[el.name]) {
                        currentStep.errors[el.name] = []
                    }
                    currentStep.errors[el.name].push(el.validationMessage)
                    el.reportValidity()
                }
            })

        if (this._params.onValidation && this._params.onValidation.constructor === Function)
            this._params.onValidation(currentStep, fields, this.$form)

        return isValid
    }

    _formElements(el) {
        return el.querySelectorAll(`\
            ${this._params.step_selector} input:not([type="hidden"]):not([disabled]),\
            ${this._params.step_selector} select:not([disabled]),\
            ${this._params.step_selector} textarea:not([disabled])\
        `)
    }
}

if (window !== undefined) {
    !window.hasOwnProperty('Zangdar') && (window.Zangdar = Zangdar)
    if(!HTMLFormElement.prototype.zangdar) {
        HTMLFormElement.prototype.zangdar = function (options) {
            return new Zangdar(this, options)
        }
    }
} else {
    module.exports = Zangdar
}
