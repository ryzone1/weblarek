import { Component } from '../base/Component';
import { ensureElement } from '../../utils/utils';
import { IEvents } from '../base/Events';

interface ICardBase {
    title: string;
    price: number | null;
}


export class Card extends Component<ICardBase> {
    protected _title: HTMLElement;
    protected _price: HTMLElement;
    protected buttonElement: HTMLButtonElement | null = null;

        constructor(
        container: HTMLElement,
        protected events: IEvents,
    ) {
        super(container);
        this._title = ensureElement<HTMLElement>('.card__title', container);
        this._price = ensureElement<HTMLElement>('.card__price', container);
    }

    set title(value: string) {
        this.setText(this._title, value);
    }

set price(value: number | null) {
        if (value === null) {
            this.setText(this._price, 'Бесценно');
            this._price.classList.add('card__price-disabled');
            if (this.buttonElement) {
                this.buttonElement.disabled = true;
                this.setText(this.buttonElement, 'Недоступно');
            }
        } else {
            this.setText(this._price, `${value} синапсов`);
            this._price.classList.remove('card__price-disabled');
            if (this.buttonElement) {
                 this.buttonElement.disabled = false;
            }
        }
    }
}