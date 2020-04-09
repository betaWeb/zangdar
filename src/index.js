const WizardStep = require('./WizardStep')
const { appendSelector, prependPolyfills, uuid, isBrowserSide, isServerSide } = require('./Utils')

prependPolyfills()

const DEFAULT_PARAMS = {
	step_selector: '[data-step]',
	prev_step_selector: '[data-prev]',
	next_step_selector: '[data-next]',
	submit_selector: '[type="submit"]',
	active_step_index: 0,
	unique_id_prefix: 'zangdar_form_',
	classes: {
		form: 'zangdar__wizard',
		prev_button: 'zangdar__prev',
		next_button: 'zangdar__next',
		step: 'zangdar__step',
		step_active: 'zangdar__step__active',
	},
	bypass_validation: false,
	onSubmit: null,
	onStepChange: null,
	onValidation: null,
	customValidation: null
}

class Zangdar {

	/**
	 * @private
	 * @type {HTMLFormElement|null}
	 */
	_$form = null

	/**
	 * @private
	 * @type {Object}
	 */
	_params = {}

	/**
	 * @private
	 * @type {HTMLElement|null}
	 */
	_$prevButtons = null

	/**
	 * @private
	 * @type {WizardStep[]}
	 */
	_steps = []

	/**
	 * @private
	 * @type {number}
	 */
	_currentIndex = 0;

	/**
	 * @private
	 * @type {string}
	 */
	_uuid = ''

	/**
	 * @param {HTMLFormElement|String} selector
	 * @param {Object} options
	 * @property {WizardStep[]} _steps
	 */
	constructor(selector, options = {}) {
		this._$form = selector instanceof HTMLFormElement
			? selector
			: document.querySelector(selector)

		if (this._$form !== null && this._$form.constructor !== HTMLFormElement)
			throw new Error(`[Err] Zangdar.constructor - the container must be a valid HTML form element`)

		this._params = {
			...DEFAULT_PARAMS,
			...options
		}

		this._$prevButtons = null
		this._steps = []
		this._currentIndex = this._params.active_step_index
		this._uuid = this._params.unique_id_prefix + uuid()

		this.onSubmit = this.onSubmit.bind(this)
		this.onPrevStep = this.onPrevStep.bind(this)
		this.onNextStep = this.onNextStep.bind(this)

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
	 * @return {number}
	 */
	count() {
		return this._steps.length
	}

	/**
	 * Refresh wizard instance
	 *
	 * @fluent 
	 * @returns {Zangdar}
	 */
	refresh() {
		this._buildPrevButton()
		this._buildSteps()

		return this
	}

	/**
	 * Destroys wizard instance
	 * @todo destroy wizard
	 */
	destroy() {
		try {
			if (this._params.prev_step_selector !== false) {
				document.querySelectorAll(this._params.prev_step_selector).forEach(btn => {
					btn.removeEventListener('click', this.onPrevStep)
				})
			}
		} catch (e) {
			console.error(`[Err] Zangdar.destroy - Cannot remove Event Listeners on prev buttons - ${e.message}`)
		}

		try {
			if (this._params.next_step_selector !== false) {
				document.querySelectorAll(this._params.next_step_selector).forEach(btn => {
					btn.removeEventListener('click', this.onNextStep)
				})
			}
		} catch (e) {
			console.error(`[Err] Zangdar.destroy - Cannot remove Event Listeners on next buttons - ${e.message}`)
		}

		try {
			this._$form.removeEventListener('submit', this.onSubmit)
		} catch (e) {
			console.error(`[Err] Zangdar.destroy - Cannot remove Event Listeners on form submit buttons - ${e.message}`)
		}
	}

	/**
	 * Get a WizardStep instance via his index or his label property (data-label attribute).
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
	 * Remove a step based on his index, label property (data-label attribute) or WizardStep instance
	 *
	 * @param {WizardStep|String|Number} key
	 * @return {Number|Boolean} returns the index of removed step if exists, false otherwize
	 */
	removeStep(key) {
		let step

		if (key instanceof WizardStep) step = key
		else step = this.getStep(key)

		if (!step) return false

		step.removeElement()
		this._steps = this._steps.filter(s => !s.indexed(step.index))
		this.refresh()

		return step.index
	}


	/**
	 * Reveals first step
	 *
	 * @fluent
	 * @returns {Zangdar}
	 */
	first() {
		this._firstStep()

		return this
	}

	/**
	 * Reveals last step
	 *
	 * @fluent
	 * @returns {Zangdar}
	 */
	last() {
		this._lastStep()

		return this
	}

	/**
	 * Reveals previous step
	 *
	 * @fluent
	 * @returns {Zangdar}
	 */
	prev() {
		this._prevStep()

		return this
	}

	/**
	 * Reveals next step
	 *
	 * @fluent
	 * @returns {Zangdar}
	 */
	next() {
		this._nextStep()

		return this
	}

	/**
	 * @param {String} key 
	 * @param {*} value
	 *
	 * @fluent
	 * @returns {Zangdar}
	 */
	setOption(key, value) {
		if (key in this._params)
			this._params[key] = value

		return this
	}

	/**
	 * Reveal a single step based on his index, label property (data-label attribute) or WizardStep instance
	 *
	 * @fluent
	 * @param {String|Number|WizardStep} value
	 * 
	 * @returns {Zangdar}
	 */
	revealStep(value) {
		try {
			let index = null

			if (value.constructor === String)
				index = this._steps.findIndex(step => step.labeled(value))
			else if (value instanceof WizardStep)
				index = value.index
			else if (value.constructor === Number)
				index = value

			if (index === undefined || index === null || index < 0)
				index = 0

			if (index !== this._currentIndex) {
				const oldStep = this.getCurrentStep()
				const direction = oldStep && oldStep.index > index ? -1 : 1

				if (direction < 0 || this._validateCurrentStep()) {
					this._currentIndex = index
					this._revealStep()
					this._onStepChange(oldStep, direction)
				}
			}

			return this
		} catch (e) {
			throw new Error(`[Err] Zangdar.revealStep - Cannot found step :: ${e.message}`)
		}
	}

	/**
	 * Create a wizard from an existing form with a template which is describes it,
	 * according to the options passed on wizard instance creation.
	 *
	 * Useful to convert programmatically a HTML form into a powerful Zangdar wizard
	 * (by keeping only choosen fields).
	 *
	 * @fluent
	 * @param {Object} template the wizard template
	 * 
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
						$section.dataset.step = label
						$section.appendChild(newElm)
						el.parentNode.removeChild(el)
					}
				})

				if (i < Object.keys(template).length && this._params.next_step_selector !== false && $section.querySelector(this._params.next_step_selector) === null) {
					let $nextButton = document.createElement('button')
					$nextButton = appendSelector(this._params.next_step_selector, null, $nextButton)
					$nextButton.dataset.next = 'next'
					$nextButton.innerText = 'Next'
					$section.appendChild($nextButton)
				}

				if (i === Object.keys(template).length && this._params.submit_selector !== false) {
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
		return this._steps.reduce((acc, step) => ({...acc, ...{[step.label]: step}}), {})
	}

	/**
	 * @param {Event} e
	 *
	 * @private
	 */
	onNextStep(e) {
		e.preventDefault()

		if (this._validateCurrentStep())
			this._nextStep()
	}

	/**
	 * @param {Event} e
	 *
	 * @private
	 */
	onPrevStep(e) {
		e.preventDefault()
		this._prevStep()
	}

	/**
	 * @param {Event} e
	 *
	 * @private
	 */
	onSubmit(e) {
		if (this._validateCurrentStep()) {
			if (this._params.onSubmit && this._params.onSubmit.constructor === Function)
				this._params.onSubmit(e)
			else e.target.submit()
		}
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
		this._$form.classList.add(this._params.classes.form)
		this._$form.dataset.wizard = this._uuid

		!this._$form.hasAttribute('name') && (this._$form.setAttribute('name', this._uuid))

		this._$form.removeEventListener('submit', this.onSubmit)
		this._$form.addEventListener('submit', this.onSubmit)
	}

	/**
	 * @private
	 */
	_buildPrevButton() {
		if (this._params.prev_step_selector === false) return

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
				btn.removeEventListener('click', this.onPrevStep)
				btn.addEventListener('click', this.onPrevStep)
			})
		}
	}

	/** 
	 * @private
	 */
	_buildSteps() {
		let steps = Array.from(this._$form.querySelectorAll(this._params.step_selector))

		this._steps = steps.reduce((acc, item, index) => {
			acc.push(this._buildStep(item, index, steps.length - 1 === index))

			let $nextButton
			if (index < steps.length - 1 && ($nextButton = item.querySelector(this._params.next_step_selector)) !== null) {
				$nextButton.classList.add(this._params.classes.next_button)
				$nextButton.removeEventListener('click', this.onNextStep)
				$nextButton.addEventListener('click', this.onNextStep)
			}

			return acc
		}, [])

		this._currentIndex = this._params.active_step_index

		this._revealStep()
	}

	/**
	 * @param {String} label
	 * @returns {Element}
	 * 
	 * @private
	 */
	_buildSection(label) {
		let $section = document.createElement('section')

		return appendSelector(this._params.step_selector, label, $section)
	}

	/**
	 * @param {HTMLElement} item
	 * @param {Number} index
	 * @param {Boolean} last
	 *
	 * @private
	 */
	_buildStep(item, index, last) {
		const label = item.dataset.step
		const isActive = index === this._params.active_step_index

		item.classList.add(this._params.classes.step)

		if (isActive) {
			item.classList.add(this._params.classes.step_active)
			this._currentIndex = index
		}

		return new WizardStep(index, item, label, isActive, last)
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
			Array.from(this._$prevButtons).forEach(btn => {
				btn.style.display = this._currentIndex === 0 ? 'none' : ''
			})
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
	 * @private
	 */
	_firstStep() {
		const oldStep = this.getCurrentStep()
		this._steps.map(step => {
			step.completed = false
			step.active = false
		})
		this._currentIndex = 0
		this._revealStep()
		this._onStepChange(oldStep, -1)
	}

	/**
	 * @private
	 */
	_lastStep() {
		const oldStep = this.getCurrentStep()
		this._currentIndex = this._steps.length - 1
		this._steps.map(step => {
			step.completed = !step.indexed(this._currentIndex)
			step.active = false
		})
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
		if (this._params.bypass_validation === true) return true;
		const currentStep = this.getCurrentStep()

		if (currentStep === undefined) return true;

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

	/**
	 * @private
	 */
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
	!window.hasOwnProperty('Zangdar') && (window['Zangdar'] = Zangdar)

	if (!HTMLFormElement.prototype.zangdar)
		HTMLFormElement.prototype.zangdar = function (options) {
			return new Zangdar(this, options)
		}
}
