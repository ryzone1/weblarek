import { Component } from '../base/Component';
import { ensureElement } from '../../utils/utils';
import {  TPayment, IOrderFormState, IContactFormState } from '../../types';
import { IEvents } from '../base/Events';


export class Order extends Component<IOrderFormState> {
    protected addressInput: HTMLInputElement;
    protected cardButton: HTMLButtonElement;
    protected cashButton: HTMLButtonElement;
    protected orderButton: HTMLButtonElement;
    protected errorsContainer: HTMLElement;
    private currentPayment: TPayment = '';

    constructor(container: HTMLElement, protected events: IEvents) {
        console.log('DEBUG: Order constructor вызван, container:', container); // <-- Добавим отладку
        super(container);
        this.addressInput = ensureElement<HTMLInputElement>('.form__input[name="address"]', container);
        this.cardButton = ensureElement<HTMLButtonElement>('.button[name="card"]', container);
        this.cashButton = ensureElement<HTMLButtonElement>('.button[name="cash"]', container);
        this.orderButton = ensureElement<HTMLButtonElement>('.order__button', container);
        this.errorsContainer = ensureElement<HTMLElement>('.form__errors', container);

        this.cardButton.addEventListener('click', () => {
            this.payment = 'card';
            this.events.emit('payment:change', { payment: 'card' as TPayment });
        });
        this.cashButton.addEventListener('click', () => {
            this.payment = 'cash';
            this.events.emit('payment:change', { payment: 'cash' as TPayment });
        });

        this.addressInput.addEventListener('input', (e) => {
            this.events.emit('address:change', { address: (e.target as HTMLInputElement).value });
        });

        this.container.addEventListener('submit', (e) => {
            e.preventDefault();
            this.events.emit('order:submit');
        });
    }

    set payment(value: TPayment) {
        this.cardButton.classList.remove('button_alt-active');
        this.cashButton.classList.remove('button_alt-active');

        if (value === 'card') {
            this.cardButton.classList.add('button_alt-active');
        } else if (value === 'cash') {
            this.cashButton.classList.add('button_alt-active');
        }
        this.currentPayment = value;
    }

    set address(value: string) {
        this.addressInput.value = value;
    }

    set errors(value: string[]) {
        this.setText(this.errorsContainer, value.join('; '));
    }

    set valid(value: boolean) {
        this.orderButton.disabled = !value;
    }


    render( data:IOrderFormState): HTMLElement { 
        super.render(data); 
        if (data.payment !== undefined) this.payment = data.payment; 
        if (data.address !== undefined) this.address = data.address; 
        if (data.errors !== undefined) this.errors = data.errors; 
        if (data.valid !== undefined) this.valid = data.valid;
        return this.container;
    }
}

export class Contacts extends Component<IContactFormState> {
    protected emailInput: HTMLInputElement;
    protected phoneInput: HTMLInputElement;
    protected submitButton: HTMLButtonElement;
    protected errorsContainer: HTMLElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);
        this.emailInput = ensureElement<HTMLInputElement>('.form__input[name="email"]', container);
        this.phoneInput = ensureElement<HTMLInputElement>('.form__input[name="phone"]', container);
        this.submitButton = ensureElement<HTMLButtonElement>('.button[type="submit"]', container);
        this.errorsContainer = ensureElement<HTMLElement>('.form__errors', container);

        this.emailInput.addEventListener('input', (e) => {
            this.events.emit('email:change', { email: (e.target as HTMLInputElement).value });
        });
        this.phoneInput.addEventListener('input', (e) => {
            this.events.emit('phone:change', { phone: (e.target as HTMLInputElement).value });
        });

        this.container.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Событие submit формы Order поймано, preventDefault вызван'); // <-- Отладка
            this.events.emit('contacts:submit');
        });
    }

    set email(value: string) {
        this.emailInput.value = value;
    }

    set phone(value: string) {
        this.phoneInput.value = value;
    }

    set errors(value: string[]) {
        this.setText(this.errorsContainer, value.join('; '));
    }

    set valid(value: boolean) {
        this.submitButton.disabled = !value;
    }

    render( data:IContactFormState): HTMLElement {
        super.render(data);
        if (data.email !== undefined) this.email = data.email;
        if (data.phone !== undefined) this.phone = data.phone;
        if (data.errors !== undefined) this.errors = data.errors;
        return this.container;
    }
}