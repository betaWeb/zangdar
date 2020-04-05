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
	#$form = null

	/**
	 * @private
	 * @type {Object}
	 */
	#params = {}

	/**
	 * @private
	 * @type {HTMLElement|null}
	 */
	#$prevButtons = null

	/**
	 * @private
	 * @type {WizardStep[]}
	 */
	#steps = []

	/**
	 * @private
	 * @type {number}
	 */
	#currentIndex = 0;

	/**
	 * @private
	 * @type {string}
	 */
	#uuid = ''

	/**
	 * @param {HTMLFormElement|String} selector
	 * @param {Object} options
	 * @property {WizardStep[]} #steps
	 */
	constructor(selector, options = {}) {
		this.#$form = selector instanceof HTMLFormElement
			? selector
			: document.querySelector(selector)

		if (this.#$form !== null && this.#$form.constructor !== HTMLFormElement)
			throw new Error(`[Err] Zangdar.constructor - the container must be a valid HTML form element`)

		this.#params = {
			...DEFAULT_PARAMS,
			...options
		}

		this.#$prevButtons = null
		this.#steps = []
		this.#currentIndex = this.#params.active_step_index
		this.#uuid = this.#params.unique_id_prefix + uuid()

		this.onSubmit = this.onSubmit.bind(this)
		this.onPrevStep = this.onPrevStep.bind(this)
		this.onNextStep = this.onNextStep.bind(this)

		this.#bindEventsContext()
		this.#init()
	}

	/**
	 * Returns current step index
	 *
	 * @returns {Number}
	 */
	get currentIndex() {
		return this.#currentIndex
	}

	/**
	 * Returns all wizard steps
	 *
	 * @returns {WizardStep[]}
	 */
	get steps() {
		return this.#steps
	}

	/**
	 * Returns form unique ID
	 *
	 * @returns {String}
	 */
	get uniqueId() {
		return this.#uuid
	}

	/**
	 * @return {number}
	 */
	count() {
		return this.#steps.length
	}

	/**
	 * Refresh wizard instance
	 *
	 * @fluent 
	 * @returns {Zangdar}
	 */
	refresh() {
		this.#buildPrevButton()
		this.#buildSteps()

		return this
	}

	/**
	 * Destroys wizard instance
	 * @todo destroy wizard
	 */
	destroy() {
		try {
			if (this.#params.prev_step_selector !== false) {
				document.querySelectorAll(this.#params.prev_step_selector).forEach(btn => {
					btn.removeEventListener('click', this.onPrevStep)
				})
			}
		} catch (e) {
			console.error(`[Err] Zangdar.destroy - Cannot remove Event Listeners on prev buttons - ${e.message}`)
		}

		try {
			if (this.#params.next_step_selector !== false) {
				document.querySelectorAll(this.#params.next_step_selector).forEach(btn => {
					btn.removeEventListener('click', this.onNextStep)
				})
			}
		} catch (e) {
			console.error(`[Err] Zangdar.destroy - Cannot remove Event Listeners on next buttons - ${e.message}`)
		}

		try {
			this.#$form.removeEventListener('submit', this.onSubmit)
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
			return this.#steps.find(step => step.labeled(key))

		if (key.constructor === Number)
			return this.#steps[key]

		return null
	}

	/**
	 * Get wizard HTML form element
	 *
	 * @returns {HTMLFormElement}
	 */
	getFormElement() {
		return this.#$form
	}

	/**
	 * Get the current step
	 *
	 * @returns {WizardStep|null} the current WizardStep instance if exists, null otherwise
	 */
	getCurrentStep() {
		return this.getStep(this.#currentIndex)
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
		this.#steps = this.#steps.filter(s => !s.indexed(step.index))
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
		this.#firstStep()

		return this
	}

	/**
	 * Reveals last step
	 *
	 * @fluent
	 * @returns {Zangdar}
	 */
	last() {
		this.#lastStep()

		return this
	}

	/**
	 * Reveals previous step
	 *
	 * @fluent
	 * @returns {Zangdar}
	 */
	prev() {
		this.#prevStep()

		return this
	}

	/**
	 * Reveals next step
	 *
	 * @fluent
	 * @returns {Zangdar}
	 */
	next() {
		this.#nextStep()

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
		if (key in this.#params)
			this.#params[key] = value

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
				index = this.#steps.findIndex(step => step.labeled(value))
			else if (value instanceof WizardStep)
				index = value.index
			else if (value.constructor === Number)
				index = value

			if (index === undefined || index === null || index < 0)
				index = 0

			if (index !== this.#currentIndex) {
				const oldStep = this.getCurrentStep()
				const direction = oldStep && oldStep.index > index ? -1 : 1

				if (direction < 0 || this.#validateCurrentStep()) {
					this.#currentIndex = index
					this.#revealStep()
					this.#onStepChange(oldStep, direction)
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
				const $section = this.#buildSection(label)
				fields.forEach(field => {
					const el = this.#$form.querySelector(field)

					if (el !== null) {
						const newElm = el.cloneNode(true)
						$section.dataset.step = label
						$section.appendChild(newElm)
						el.parentNode.removeChild(el)
					}
				})

				if (i < Object.keys(template).length && this.#params.next_step_selector !== false && $section.querySelector(this.#params.next_step_selector) === null) {
					let $nextButton = document.createElement('button')
					$nextButton = appendSelector(this.#params.next_step_selector, null, $nextButton)
					$nextButton.dataset.next = 'next'
					$nextButton.innerText = 'Next'
					$section.appendChild($nextButton)
				}

				if (i === Object.keys(template).length && this.#params.submit_selector !== false) {
					const $submitButton = this.#$form.querySelector(this.#params.submit_selector)

					if ($submitButton !== null) {
						const newBtn = $submitButton.cloneNode(true)
						$section.appendChild(newBtn)
						$submitButton.parentNode.removeChild($submitButton)
					}
				}
				this.#$form.appendChild($section)
			}
		}

		this.#init()

		return this
	}

	/**
	 * @returns {Object}
	 */
	getBreadcrumb() {
		return this.#steps.reduce((acc, step) => ({...acc, ...{[step.label]: step}}), {})
	}

	/**
	 * @param {Event} e
	 *
	 * @private
	 */
	onNextStep(e) {
		e.preventDefault()

		if (this.#validateCurrentStep())
			this.#nextStep()
	}

	/**
	 * @param {Event} e
	 *
	 * @private
	 */
	onPrevStep(e) {
		e.preventDefault()
		this.#prevStep()
	}

	/**
	 * @param {Event} e
	 *
	 * @private
	 */
	onSubmit(e) {
		if (this.#validateCurrentStep()) {
			if (this.#params.onSubmit && this.#params.onSubmit.constructor === Function)
				this.#params.onSubmit(e)
			else e.target.submit()
		}
	}

	/**
	 * @private
	 */
	#init() {
		if (this.#$form.querySelectorAll(this.#params.step_selector).length) {
			this.#buildForm()
			this.#buildPrevButton()
			this.#buildSteps()
		}
	}

	/**
	 * @private
	 */
	#buildForm() {
		this.#$form.classList.add(this.#params.classes.form)
		this.#$form.dataset.wizard = this.#uuid

		!this.#$form.hasAttribute('name') && (this.#$form.setAttribute('name', this.#uuid))

		this.#$form.removeEventListener('submit', this.onSubmit)
		this.#$form.addEventListener('submit', this.onSubmit)
	}

	/**
	 * @private
	 */
	#buildPrevButton() {
		if (this.#params.prev_step_selector === false) return

		this.#$prevButtons = this.#$form.querySelectorAll(this.#params.prev_step_selector)

		if (!this.#$prevButtons || !this.#$prevButtons.length) {
			const $prevBtn = document.createElement('button')
			$prevBtn.setAttribute('data-prev', '')
			$prevBtn.innerText = 'Prev.'
			this.#$form.insertBefore($prevBtn, this.#$form.firstChild)
			this.#buildPrevButton()
		} else {
			Array.from(this.#$prevButtons).forEach(btn => {
				btn.classList.add(this.#params.classes.prev_button)
				btn.removeEventListener('click', this.onPrevStep)
				btn.addEventListener('click', this.onPrevStep)
			})
		}
	}

	/** 
	 * @private
	 */
	#buildSteps() {
		let steps = Array.from(this.#$form.querySelectorAll(this.#params.step_selector))

		this.#steps = steps.reduce((acc, item, index) => {
			acc.push(this.#buildStep(item, index, steps.length - 1 === index))

			let $nextButton
			if (index < steps.length - 1 && ($nextButton = item.querySelector(this.#params.next_step_selector)) !== null) {
				$nextButton.classList.add(this.#params.classes.next_button)
				$nextButton.removeEventListener('click', this.onNextStep)
				$nextButton.addEventListener('click', this.onNextStep)
			}

			return acc
		}, [])

		this.#currentIndex = this.#params.active_step_index

		this.#revealStep()
	}

	/**
	 * @param {String} label
	 * @returns {Element}
	 * 
	 * @private
	 */
	#buildSection(label) {
		let $section = document.createElement('section')

		return appendSelector(this.#params.step_selector, label, $section)
	}

	/**
	 * @param {HTMLElement} item
	 * @param {Number} index
	 * @param {Boolean} last
	 *
	 * @private
	 */
	#buildStep(item, index, last) {
		const label = item.dataset.step
		const isActive = index === this.#params.active_step_index

		item.classList.add(this.#params.classes.step)

		if (isActive) {
			item.classList.add(this.#params.classes.step_active)
			this.#currentIndex = index
		}

		return new WizardStep(index, item, label, isActive, last)
	}

	/**
	 * @private
	 */
	#revealStep() {
		this.#steps.forEach((step, i) => {
			this.#steps[i].active = step.indexed(this.#currentIndex)
			if (step.active)
				step.element.classList.add(this.#params.classes.step_active)
			else
				step.element.classList.remove(this.#params.classes.step_active)
		})
		this.#hidePrevBtns()
	}

	/**
	 * @private
	 */
	#hidePrevBtns() {
		if (!this.#$prevButtons || !this.#$prevButtons.length)
			this.#buildPrevButton()
		else
			Array.from(this.#$prevButtons).forEach(btn => {
				btn.style.display = this.#currentIndex === 0 ? 'none' : ''
			})
	}

	/**
	 * @private
	 */
	#prevStep() {
		const oldStep = this.getCurrentStep()
		oldStep.completed = false
		this.#currentIndex = this.#currentIndex - 1 < 0 ? 0 : this.#currentIndex - 1
		this.#revealStep()
		this.#onStepChange(oldStep, -1)
	}

	/**
	 * @private
	 */
	#nextStep() {
		const oldStep = this.getCurrentStep()
		oldStep.completed = true
		this.#currentIndex = this.#currentIndex < this.#steps.length - 1
			? this.#currentIndex + 1
			: this.#steps.length
		this.#revealStep()
		this.#onStepChange(oldStep, 1)
	}

	/**
	 * @private
	 */
	#firstStep() {
		const oldStep = this.getCurrentStep()
		this.#steps.map(step => {
			step.completed = false
			step.active = false
		})
		this.#currentIndex = 0
		this.#revealStep()
		this.#onStepChange(oldStep, -1)
	}

	/**
	 * @private
	 */
	#lastStep() {
		const oldStep = this.getCurrentStep()
		this.#currentIndex = this.#steps.length - 1
		this.#steps.map(step => {
			step.completed = !step.indexed(this.#currentIndex)
			step.active = false
		})
		this.#revealStep()
		this.#onStepChange(oldStep, 1)
	}

	/**
	 * @param {WizardStep} oldStep
	 * @param {Number} direction
	 * @private
	 */
	#onStepChange(oldStep, direction) {
		if (this.#params.onStepChange && this.#params.onStepChange.constructor === Function)
			this.#params.onStepChange(this.getCurrentStep(), oldStep, direction, this.#$form)
	}

	/**
	 * @private
	 */
	#validateCurrentStep() {
		if (this.#params.bypass_validation === true) return true;
		const currentStep = this.getCurrentStep()

		if (currentStep === undefined) return true;

		if (this.#params.customValidation && this.#params.customValidation.constructor === Function) {
			this.#$form.setAttribute('novalidate', '')

			return this.#params.customValidation(currentStep, currentStep.fields, this.#$form)
		}

		this.#$form.removeAttribute('novalidate')
		const isValid = currentStep.validate()
		let customValid = true

		if (this.#params.onValidation && this.#params.onValidation.constructor === Function)
			customValid = this.#params.onValidation(currentStep, currentStep.fields, this.#$form)

		return isValid && customValid
	}

	/**
	 * @private
	 */
	#bindEventsContext() {
		['onSubmit', 'onStepChange', 'onValidation', 'customValidation']
			.forEach(eventName => {
				if (this.#params[eventName] && this.#params[eventName].constructor === Function)
					this.#params[eventName] = this.#params[eventName].bind(this)
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
