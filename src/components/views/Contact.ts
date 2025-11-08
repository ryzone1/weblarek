import { BaseForm } from './BaseForm';
import { ensureElement } from '../../utils/utils';
import { IContactFormState } from '../../types';
import { IEvents } from '../base/Events';

export class Contacts extends BaseForm<IContactFormState> {

    protected emailInput: HTMLInputElement;
    protected phoneInput: HTMLInputElement;


    constructor(container: HTMLElement, events: IEvents) { 
        super(container, events, 'contacts:submit');

        this.emailInput = ensureElement<HTMLInputElement>('.form__input[name="email"]', container);
        this.phoneInput = ensureElement<HTMLInputElement>('.form__input[name="phone"]', container);

        this.emailInput.addEventListener('input', (e) => {
            this.events.emit('email:change', { email: (e.target as HTMLInputElement).value });
        });
        this.phoneInput.addEventListener('input', (e) => {
            this.events.emit('phone:change', { phone: (e.target as HTMLInputElement).value });
        });
    }

    set email(value: string) {
        this.emailInput.value = value;
    }

    set phone(value: string) {
        this.phoneInput.value = value;
    }

    render( data:IContactFormState): HTMLElement {
        super.render(data);
        if (data.email !== undefined) this.email = data.email;
        if (data.phone !== undefined) this.phone = data.phone;
        return this.container;
    }
}