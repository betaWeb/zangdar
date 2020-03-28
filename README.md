# Zangdar Wizard
A JavaScript class to simply generate and handle HTML form wizards.

You can find a very simple [demo](https://codepen.io/betaweb/pen/dLBbbq) at this link, and the [API here](https://betaweb.github.io/zangdar/).<br>

<br><br>


## Getting started
### Installation
To install Zangdar, you just have to download `zangdar.min.js` in the `dist` folder and add a script into your HTML page :
```HTML
<script src="path/to/zangdar.min.js"></script>
```

Your have to add this basic CSS to your styles too :
```CSS
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
```HTML
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
```JS
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
```JS
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
