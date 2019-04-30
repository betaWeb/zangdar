# zangdar
A JavaScript class to simply generate and handle HTML form wizards.

<br><br>


## Getting started
### Installation
To install Zangdar, you just have to download `zangdar.min.js` in the `dist` folder and add a script into your HTML page :
```HTML
<script src="path/to/zangdar.min.js"></script>
```

Your have to add the basic CSS to your styles too :
```CSS
.zandgar__wizard .zandgar__step {
    display: none;
}
.zandgar__wizard .zandgar__step.zandgar__step__active {
    display: block;
}
```

<br>


### Basic usage

Here a basic HTML form with sections to separate wizard parts :
```HTML
<form id="my-form">
    <section data-step="1">
        <input type="text" name="name" placeholder="Your name here...">
        <input type="text" name="email" placeholder="Your email here...">
        
        <button data-next>Next</button>
    </section>
    
    <section data-step="1">
        <input type="password" name="password" placeholder="Your password here...">
        <input type="password" name="password_confirm" placeholder="Confirm your password here...">
        
        <button data-next>Next</button>
    </section>
    
    <section data-step="1">
        <input type="date" name="birthdate" placeholder="Your birthdate...">
        <input type="text" name="addresss" placeholder="Your address here...">
        <input type="number" name="zipcode" placeholder="Your zipcode here...">
        <input type="text" name="city" placeholder="Your city here...">
        
        <button type="submit">Send</button>
    </section>
</form>
```

<br>

And you just have to instanciate Zandgar with the selector of the form you wan't to handle :
```JS
document.addEventListener('DOMContentLoaded', () => {
    const wizard = new Zangdar('#my-form')
})
```

And.. voilà ! You have a fully functional wizard ! :)
