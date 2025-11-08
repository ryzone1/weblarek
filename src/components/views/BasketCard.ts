import { Card } from './Card';
import { ensureElement } from '../../utils/utils';
import { IEvents } from '../base/Events';

interface IBasketCardData {
    id: string;
    title: string;
    price: number | null;
    index?: number;
}
export class BasketCard extends Card {
    protected indexElement: HTMLElement;
    protected deleteButton: HTMLButtonElement;

    constructor(
        container: HTMLElement,
        events: IEvents,
        actions?: { onClick: (event: MouseEvent) => void }
    ) {
        super(container, events);
        this.indexElement = ensureElement<HTMLElement>('.basket__item-index', container);
        this.deleteButton = ensureElement<HTMLButtonElement>('.basket__item-delete', container);

        if (actions?.onClick) {
            this.deleteButton.addEventListener('click', actions.onClick);
        }
    }

    set index(value: number) {
        this.setText(this.indexElement, String(value));
    }

    render( data:IBasketCardData): HTMLElement {
        super.render({ title: data.title, price: data.price });
        if (data.index !== undefined) {
            this.index = data.index;
        }
        return this.container;
    }
}