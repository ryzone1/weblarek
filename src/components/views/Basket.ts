import { Component } from '../base/Component';
import { ensureElement } from '../../utils/utils';
import { IEvents } from '../base/Events';

interface IBasketData {
    items: HTMLElement[];
    total: number;
}

export class Basket extends Component<IBasketData> {
    protected list: HTMLElement;
    protected totalElement: HTMLElement;
    protected button: HTMLButtonElement;
    protected emptyMessageElement: HTMLElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);
        this.list = ensureElement<HTMLElement>('.basket__list', container);
        this.totalElement = ensureElement<HTMLElement>('.basket__price', container);
        this.button = ensureElement<HTMLButtonElement>('.basket__button', container);
        this.emptyMessageElement = ensureElement<HTMLElement>('.basket__empty-message', container);
        

        this.button.addEventListener('click', () => {
            events.emit('order:open');
        });
    }


    set items(items: HTMLElement[]) {
        this.list.replaceChildren(...items);
        if (items.length === 0) {
            this.list.hidden = true; 
            this.emptyMessageElement.hidden = false; 
            this.button.disabled = true; 
        } else {
            this.list.hidden = false; 
            this.emptyMessageElement.hidden = true; 
            this.button.disabled = false; 
        }
    }

set total(value: number) {
    this.setText(this.totalElement, `${value} синапсов`);
}

    render(data: IBasketData): HTMLElement {
        super.render(data);
        this.items = data.items;
        this.total = data.total;
        return this.container;
    }
}