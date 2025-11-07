import { Component } from '../base/Component';
import { ensureElement } from '../../utils/utils';
import { IEvents } from '../base/Events';
import { CDN_URL } from '../../utils/constants';

export const categoryMap: { [key: string]: string } = {
    'дополнительное': 'card__category_additional',
    'кнопка': 'card__category_button',
    'софт-скил': 'card__category_soft',
    'хард-скил': 'card__category_hard',
    'другое': 'card__category_other',
};

interface ICardBase {
    title: string;
    image?: string;
    price: number | null;
    category?: string;
    description?: string;
    inBasket?: boolean;
}

interface ICardActions {
    onClick: (event: MouseEvent) => void;
}

export class Card extends Component<ICardBase> {
    protected _title: HTMLElement;
    protected imageElement: HTMLImageElement | null;
    protected _price: HTMLElement; 
    protected _category: HTMLElement | null;
    protected _description: HTMLElement | null; 
    protected button: HTMLButtonElement | null; 

        constructor(
        container: HTMLElement,
        protected events: IEvents,
        actions?: ICardActions
    ) {
        super(container);
        this._title = ensureElement<HTMLElement>('.card__title', container);
        this._price = ensureElement<HTMLElement>('.card__price', container);
        this._category = container.querySelector('.card__category');
        this._description = container.querySelector('.card__text');
        this.imageElement = container.querySelector('.card__image');
        this.button = container.querySelector('.card__button');

        if (actions?.onClick) {
            if (this.button) {
                this.button.addEventListener('click', actions.onClick);
            } else {
                container.addEventListener('click', actions.onClick);
            }
        } 
    }

    set title(value: string) {
        this.setText(this._title, value);
    }

    set image(value: string | undefined) {
        if (this.imageElement) {
            if (value) {
                let src = CDN_URL+value;
                this.setImage(this.imageElement, src, this._title.textContent || '');
            } else {
                this.imageElement.src = '';
                this.imageElement.alt = '';
            }
        }
    }

set price(value: number | null) {
        if (value === null) {
            this.setText(this._price, 'Бесценно'); 
            this._price.classList.add('card__price-disabled');
            if (this.button) {
                this.button.disabled = true; 
                this.setText(this.button, 'Недоступно'); 
            }
        } else {
            this.setText(this._price, `${value} синапсов`);
            this._price.classList.remove('card__price-disabled');
        }}

    set category(value: string | undefined) {
        if (this._category) {
            if (value) {
                this.setText(this._category, value);
                Object.values(categoryMap).forEach(cls => this._category!.classList.remove(cls));
                const mappedClass = categoryMap[value];
                if (mappedClass) {
                    this._category.classList.add(mappedClass);
                }
            } else {
                this.setText(this._category, '');
                Object.values(categoryMap).forEach(cls => this._category!.classList.remove(cls));
            }
        }
    }

    set description(value: string | undefined) {
        if (this._description) {
            this.setText(this._description, value || '');
        }
    }

     set inBasket(value: boolean) {
        if (this.button) {
            if (value) {
                this.setText(this.button, 'Удалить из корзины'); 
            } else {
                this.setText(this.button, 'В корзину');
            }
        }
    }
}


interface ICatalogCard extends ICardBase {
    id: string;
}


interface ICatalogCard extends ICardBase {
    id: string;
}

export class CatalogCard extends Card {
    constructor(
        container: HTMLElement,
        events: IEvents,
        actions?: { onClick: (event: MouseEvent) => void }
    ) {
        super(container, events, actions); 
    }

    override render(data: ICatalogCard): HTMLElement {
        super.render(data); 
        this.title = data.title;
        this.image = data.image;
        this.price = data.price;
        this.category = data.category;
        this.description = data.description;
        return this.container;
    }
}

interface IBasketCard {
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
        super(container, events, actions);
        this.deleteButton = ensureElement<HTMLButtonElement>('.basket__item-delete', container); 
        this.indexElement = ensureElement<HTMLElement>('.basket__item-index', container); 

        if (actions?.onClick) {
            this.deleteButton.addEventListener('click', actions.onClick);
        }
    }

    set index(value: number) {
        this.setText(this.indexElement, String(value));
    }

    override render(data: IBasketCard): HTMLElement {
        super.render(data); 
        this.title = data.title;
        this.price = data.price;
        if (data.index !== undefined) {
            this.index = data.index;
        }
        return this.container;
    }
}