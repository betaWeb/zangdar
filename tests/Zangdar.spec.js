const domExtra = require('@testing-library/jest-dom')
require('../index')
const {readFileSync} = require('fs')

expect.extend(domExtra)

beforeAll(async () => {
    document.body.innerHTML = readFileSync('tests/index.html', 'UTF-8').toString()
    this.wizard = new window.Zangdar(document.getElementById('wizard-form'))
})

describe('Zangdar wizard', () => {

    it('Should initialize the wizard with 3 steps', () => {
        expect(this.wizard.count()).toEqual(3)
    })

    it('should have step 1 active', () => {
        expect(this.wizard.getStep(0).isActive()).toBeTrue()
        expect(this.wizard.getStep(1).isActive()).toBeFalse()
        expect(this.wizard.getStep(2).isActive()).toBeFalse()
    })

    it('should navigate properly between steps', () => {
        const step1 = this.wizard.getStep(0)
        const step2 = this.wizard.getStep(1)
        const step3 = this.wizard.getStep(2)

        this.wizard.next()
        expect(step1.isActive()).toBeFalse()
        expect(step2.isActive()).toBeTrue()
        expect(step3.isActive()).toBeFalse()

        this.wizard.next()
        expect(step1.isActive()).toBeFalse()
        expect(step2.isActive()).toBeFalse()
        expect(step3.isActive()).toBeTrue()

        this.wizard.prev()
        expect(step1.isActive()).toBeFalse()
        expect(step2.isActive()).toBeTrue()
        expect(step3.isActive()).toBeFalse()

        this.wizard.last()
        expect(step1.isActive()).toBeFalse()
        expect(step2.isActive()).toBeFalse()
        expect(step3.isActive()).toBeTrue()

        this.wizard.first()
        expect(step1.isActive()).toBeTrue()
        expect(step2.isActive()).toBeFalse()
        expect(step3.isActive()).toBeFalse()
    })

    it('should validate form properly', () => {
        const step1 = this.wizard.getStep(0)
        const step2 = this.wizard.getStep(1)

        this.wizard.revealStep(step2.label)

        expect(step1.hasErrors()).toBeTrue()
        expect(step1.isActive()).toBeTrue()
        expect(step2.isActive()).toBeFalse()
        expect(step1.errors).toContainAllKeys(['email', 'name'])
        expect(step1.errors['name']).toContainEqual('Constraints not satisfied')
        expect(step1.errors['email']).toContainEqual('Constraints not satisfied')

        step1.fields['name'].value = 'Foo'
        step1.fields['email'].value = 'email@test.local'

        this.wizard.revealStep(step2.label)

        expect(step1.hasErrors()).toBeFalse()
        expect(step1.isActive()).toBeFalse()
        expect(step2.isActive()).toBeTrue()

    })

})