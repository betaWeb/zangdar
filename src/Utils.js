const Utils = {

	get isBrowserSide() {
		return typeof window !== 'undefined' && typeof document !== 'undefined'
	},

	get isServerSide() {
		return typeof module !== 'undefined' &&
			typeof module.exports !== 'undefined' &&
			typeof global !== 'undefined'
	},

	/**
	 * Get form inputs
	 *
	 * @param {Element} element
	 * @param {Boolean} to_array
	 * @returns {NodeListOf<Element>|Array}
	 */
	getFormElements(element, to_array = false) {
		const elements = element.querySelectorAll(`\
            input:not([type="hidden"]):not([disabled]),\
            select:not([disabled]),\
            textarea:not([disabled])\
        `)
		return to_array
			? Array.from(elements)
			: elements
	},

	/**
	 * Append a selector to an element
	 *
	 * @param {String} selector
	 * @param {String|null} value
	 * @param {Element} element
	 * @returns {Element}
	 */
	appendSelector(selector, value, element) {
		if (selector.startsWith('.'))
			element.classList.add(selector.slice(1))
		else if (selector.startsWith('#'))
			element.id = selector.slice(1)
		else {
			var re = /^.*\[(?<datakey>[a-zA-Z\@\:\-\.]+)(\=['|"]?(?<dataval>\S+)['|"]?)?\]$/
			let matches = selector.match(re)

			if (matches && matches.length) {
				const key = matches.groups.datakey || matches[1] || null
				const val = value || matches.groups.dataval || matches[3] || ''

				if (key) element.setAttribute(key, val)
			}
		}

		return element
	},

	/**
	 * Prepend babel polyfill file
	 */
	prependPolyfills() {
		if ((Utils.isServerSide && !global._babelPolyfill) || (Utils.isBrowserSide && !window._babelPolyfill))
			require('@babel/polyfill')
	},

	/**
	 * Generates an unique ID
	 *
	 * @returns {string}
	 */
	uuid() {
		return 'xxxxxxxx-xxxx-4xxx'.replace(/x/g, c => {
			const r = Math.random() * 16 | 0
			return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
		})
	}

}

module.exports = Utils