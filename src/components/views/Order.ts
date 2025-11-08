import { BaseForm } from './BaseForm';
import { ensureElement } from '../../utils/utils';
import { IOrderFormState, TPayment } from '../../types';
import { IEvents } from '../base/Events';

export class Order extends BaseForm<IOrderFormState> {

    protected addressInput: HTMLInputElement;
    protected cardButton: HTMLButtonElement;
    protected cashButton: HTMLButtonElement;

    constructor(container: HTMLElement, events: IEvents) {
        super(container, events, 'order:submit');

        this.addressInput = ensureElement<HTMLInputElement>('.form__input[name="address"]', container);
        this.cardButton = ensureElement<HTMLButtonElement>('.button[name="card"]', container);
        this.cashButton = ensureElement<HTMLButtonElement>('.button[name="cash"]', container);

        this.cardButton.addEventListener('click', () => {
            this.payment = 'card';
            this.events.emit('payment:method:selected', { payment: 'card' as TPayment });
        });
        this.cashButton.addEventListener('click', () => {
            this.payment = 'cash';
            this.events.emit('payment:method:selected', { payment: 'cash' as TPayment });
        });

        this.addressInput.addEventListener('input', (e) => {
            this.events.emit('address:change', { address: (e.target as HTMLInputElement).value });
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
    }

    set address(value: string) {
        this.addressInput.value = value;
    }

    render( data:IOrderFormState): HTMLElement {
        super.render(data);
        if (data.payment !== undefined) this.payment = data.payment;
        if (data.address !== undefined) this.address = data.address;
        return this.container;
    }
}