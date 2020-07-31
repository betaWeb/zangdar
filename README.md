# Zangdar Wizard
A JavaScript class to simply generate and handle HTML form wizards.

You can find a very simple [demo](https://codepen.io/betaweb/pen/dLBbbq) at this link, and the [API documentation here](https://betaweb.github.io/zangdar/).<br>

<br><br>


## Getting started
### Installation
To install Zangdar, you just have to download `zangdar.min.js` in the `dist` folder and add a script into your HTML page :
```html
<script src="path/to/zangdar.min.js"></script>
```

Your have to add this basic CSS to your styles too :
```css
.zangdar__wizard .zangdar__step {
    display: none;
}
.zangdar__wizard .zangdar__step.zangdar__step__active {
    display: block;
}
```

<br>


### Basic usage

Here a basic HTML form with sections to separate wizard parts :
```html
<form id="my-form">
    <section data-step="coords">
        <input type="text" name="name" placeholder="Your name here...">
        <input type="text" name="email" placeholder="Your email here...">
        
        <button data-next>Next</button>
    </section>
    
    <section data-step="security">
        <input type="password" name="password" placeholder="Your password here...">
        <input type="password" name="password_confirm" placeholder="Confirm your password here...">
        
        <button data-prev>Previous</button>
        <button data-next>Next</button>
    </section>
    
    <section data-step="personal">
        <input type="date" name="birthdate" placeholder="Your birthdate...">
        <input type="text" name="addresss" placeholder="Your address here...">
        <input type="number" name="zipcode" placeholder="Your zipcode here...">
        <input type="text" name="city" placeholder="Your city here...">
        
        <button data-prev>Previous</button>
        <button type="submit">Send</button>
    </section>
</form>
```

<br>

And you just have to instanciate Zangdar with the selector of the form you wan't to handle :
```javascript
document.addEventListener('DOMContentLoaded', () => {
    const wizard = new Zangdar('#my-form')
})
```

And.. voilà ! You have a fully functional wizard ! :)

<br>

### Options & Events

You can pass an object of options as second class parameter. This is very useful, especially for adding events to the wizard lifecycle.

List of properties here :

Name | Type | Default | Description
--- | --- | --- | ---
**step_selector** | *String* | `[data-step]` | Wizard step section selector
**prev_step_selector** | *String* | `[data-prev]` | Wizard step previous button (or any element) selector
**prev_step_selector** | *String* | `[data-next]` | Wizard step next button (or any element) selector
**submit_selector** | *String* | `[type="submit"]` | Wizard form submit button selector
**active_step_index** | *Number* | `0` | Wizard active step index (useful to define active step on wizard instanciation)
**classes.form** | *String* | `zangdar__wizard` | Wizard form CSS class
**classes.prev_button** | *String* | `zangdar__prev` | Wizard previous button (or any element) CSS class
**classes.next_button** | *String* | `zangdar__next` | Wizard next button (or any element) CSS class
**classes.step** | *String* | `zangdar__step` | Wizard step section CSS class
**classes.step_active** | *String* | `zangdar__step__active` | Wizard active step section CSS class
**bypass_validation** | *Boolean* | `false` | Bypass native browser validation or user custom validation

<br>

List of events here :

Name | Type | Default | Parameters | Description
--- | --- | --- | --- | ---
**onSubmit** | *Function* | `null` | `{Event} e` | Wizard form custom submit handler (see example below) 
**onStepChange** | *Function* | `null` | `{WizardStep} step`<br>`{Object} oldStep`<br>`{Number} direction`<br>`{HTMLFormElement} form` | method triggered when a step changes (see example below)
**onValidation** | *Function* | `null` | `{WizardStep} step`<br>`{NodeListOf} fields`<br>`{HTMLFormElement} form` | method triggered on wizard step HTML validation (see example below)
**customValidation** | *Function* | `null` | `{WizardStep} step`<br>`{NodeListOf} fields`<br>`{HTMLFormElement} form` | method triggered on wizard step HTML validation (see example below)

<br>

Here there are examples for the events listed above :
```javascript
const wizard = new Zangdar('#my-form', {
    onSubmit(e) {
        e.preventDefault()
        
        // Ajax call, custom form processing or anything you wan't to do here...
        
        return false
    },
    
    onStepChange(step, oldStep, direction, form) {
        const breadcrumb = this.getBreadcrumb() // this refers to Zangdar form wizard instance
    },
    
    onValidation(step, fields, form) {
        if (step.hasErrors()) {
            // ...
        }
        // Here a treatment after HTML native validation...
    },
    
    customValidation(step, fields, form) {
        // Use the Formr library to validate fields (https://github.com/betaWeb/formr)
        const validator = new Formr(form)
        if (step.labeled('...')) {
            validator
                .required('name', 'email', 'password', 'confirm_password')
                .string('name', 'email', 'password', 'confirm_password')
                .email('email')
                .length('password', 3, 20)
                .length('confirm_password', 3, 20)
                .same('password', 'confirm_password')
                .validateAll()
                
             if (!validator.isValid()) {
                 // ...
                 return false
             }
             return true
        }
        //...
    }
})
```
<br>

## Available methods, getters and setters
You can retrieve all available methods on the [API documentation](https://betaweb.github.io/zangdar/).

<br>

### Zangdar object
#### Getters

* `currentIndex: number`

Returns current wizard step index.

```javascript
Zangdar.currentIndex
```

<br>

* `steps: WizardStep[]`

Returns an array of wizard steps.

```javascript
const strps = Zangdar.steps
```

<br>

* `uniqueId: String`

Returns the wizard instance unique id. Useful if you have more than one instance of the wizard on the page.

```javascript
const wizard_uuid = Zangdar.uniqueId
```

<br><br>

#### Setters
No setters currently available.

<br><br>

#### Methods

* `refresh(): Zangdar`

Refresh the wizard instance. Useful to refresh the DOM (when steps order has changed, for example).
> Fluent method : can be chained with other methods

```javascript
Zangdar.refresh()
```

<br>

* `destroy(): Zangdar`

Remove all listeners and destroys the wizard instance.
> Fluent method : can be chained with other methods

```javascript
Zangdar.destroy()
```

<br>

* `setOption(key: String, value: any): Zangdar`

Set an instance' option. (you can retrieve the options list above).
> Fluent method : can be chained with other methods

```javascript
Zangdar.setOption('active_step_index', 3)
Zangdar.setOption('bypass_validation', true)
Zangdar.refresh()
```

<br>

* `getStep(key: String|Number): WizardStep|null`

Get a WizardStep instance via his index or his label property (data-label attribute).

```javascript
// With step index
const step1 = Zangdar.getStep(1)

// OR with step label
const step_one = Zangdar.getStep('one')
```

<br>

* `getFormElement(): HTMLFormElement`

Get wizard HTML form element.

```javascript
const form = Zangdar.getFormElement()
```

<br>

* `getCurrentStep(): WizardStep|null`

Get the current WizardStep instance.

```javascript
const currentStep = Zangdar.getCurrentStep()
```

<br>

* `removeStep(key: Number|String|WizardStep): WizardStep|null`

Remove a step based on his index, label property (data-label attribute) or WizardStep instance.

```javascript
const step = Zangdar.getStep('step_six')
const removedIndex = Zangdar.removeStep(step)

// you can refresh the wizard after the step removal
Zangdar.refresh()
```

<br>

* `first(): Zangdar`

Reveals first step.
> Fluent method : can be chained with other methods

```javascript
Zangdar.first()
```

<br>

* `last(): Zangdar`

Reveals last step.
> Fluent method : can be chained with other methods

```javascript
Zangdar.last()
```

<br>

* `prev(): Zangdar`

Reveals prev step.
> Fluent method : can be chained with other methods

```javascript
Zangdar.prev()
```

<br>

* `next(): Zangdar`

Reveals next step.
> Fluent method : can be chained with other methods

```javascript
Zangdar.next()
```

<br>

* `revealStep(key: Number|String|WizardStep): Zangdar`

Reveal a single step based on his index, label property (data-label attribute) or WizardStep instance.
> Fluent method : can be chained with other methods

```javascript
try {
	// With his index
	Zangdar.revealStep(3)
	
	// OR with his label (data-label attribute)
	Zangdar.revealStep('step_three')
	
	// OR event with a WizardStep instance
	const step = Zangdar.getStep('step_three')
	// ...
	Zangdar.revealStep(step)
} catch (e) {
	// Step not found
}
```

<br>

* `createFromTemplate(template: Object): Zangdar`

Create a wizard from an existing form with a template which is describes it, according to the options passed on wizard instance creation.
Useful to convert programmatically a HTML form into a powerful Zangdar wizard (by keeping only choosen fields).
> Fluent method : can be chained with other methods

```html
<form id="my_form">
	<!-- Gonna be "step_one" -->
	<div class="field__name">
		<label for="name">Name</label>
		<input type="text" id="name" name="name" required>
	</div>
	<div class="field__email">
		<label for="email">Email</label>
		<input type="text" id="email" name="email" required>
	</div>

	<!-- Gonna be "step_two" -->
	<div class="field__password">
		<label for="password">Password</label>
		<input type="password" id="password" name="password" required>
	</div>
	<div class="field__password_confirm">
		<label for="password_confirm">Confirm password</label>
		<input type="password" id="password_confirm" name="password_confirm" required>
	</div>

	<!-- Gonna be "step_three" -->
	<div class="field__genre">
		<label for="genre">Select your gender</label>
		<select id="genre" name="genre" required>
			<option value="" disabled selected>Select...</option>
			<option value="1">Male</option>
			<option value="2">Female</option>
			<option value="3">Other</option>
		</select>
	</div>
	<button type="submit">Send</button>
</form>
```

```javascript
const wizard = new Zangdar('#my_form')
const template = {
 'step_one': ['.field__name', '.field__email'],
 'step_two': ['.field__password', '.field__password_confirm'],
 'step_three': ['.field__genre']
}

wizard.createFromTemplate(template)
```

The generated wizard HTML markup will be :
```html
<form id="my_form">
	<section data-label="step_one">
		<div class="field__name">
			<label for="name">Name</label>
			<input type="text" id="name" name="name" required>
		</div>
		<div class="field__email">
			<label for="email">Email</label>
			<input type="text" id="email" name="email" required>
		</div>
		<button data-next>Next</button>
	</section>

	<section data-label="step_two">
		<div class="field__password">
			<label for="password">Password</label>
			<input type="password" id="password" name="password" required>
		</div>
		<div class="field__password_confirm">
			<label for="password_confirm">Confirm password</label>
			<input type="password" id="password_confirm" name="password_confirm" required>
		</div>
		<button data-prev>Prev</button>
		<button data-next>Next</button>
	</section>

	<section data-label="step_three">
		<div class="field__genre">
			<label for="genre">Select your gender</label>
			<select id="genre" name="genre" required>
				<option value="" disabled selected>Select...</option>
				<option value="1">Male</option>
				<option value="2">Female</option>
				<option value="3">Other</option>
			</select>
		</div>
		<button type="submit">Send</button>
	</section>
</form>
```

<br>

* `getBreadcrumb(): Object`

Returns an object representing the wizard breadcrumb with the label property as key, and the WizardStep as value.

```javascript
const breadcrumb = Zangdar.getBreadcrumb()
```

<br><br>

## TODO
 * [ ] Add WizardStep **Available methods, getters and setters** readme section
 * [ ] Update gh-pages API docs
 * [ ] Fix last step non functional custom validation
