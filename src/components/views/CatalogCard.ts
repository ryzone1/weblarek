import { Card } from './Card';
import { IEvents } from '../base/Events';
import { CDN_URL } from '../../utils/constants';

interface ICatalogCardData {
    id: string;
    title: string;
    image: string;
    price: number | null;
    category: string;
    description?: string;
}

export class CatalogCard extends Card {
    protected imageElement: HTMLImageElement | null;
    protected _category: HTMLElement | null; 
    protected _description: HTMLElement | null;
    protected buttonElement: HTMLButtonElement | null;

    constructor(
        container: HTMLElement,
        events: IEvents,
        actions?: { onClick: (event: MouseEvent) => void }
    ) {
        super(container, events);
        this.imageElement = container.querySelector('.card__image'); 
        this._category = container.querySelector('.card__category'); 
        this._description = container.querySelector('.card__text'); 
        this.buttonElement = container.querySelector('.card__button');

        if (actions?.onClick) {
            if (this.buttonElement) {
                this.buttonElement.addEventListener('click', actions.onClick);
            } else {
                container.addEventListener('click', actions.onClick);
            }
        }
    }
    set image(value: string) {
        if (this.imageElement) {
            let src = CDN_URL+value;
            this.setImage(this.imageElement, src, this._title.textContent || '');
        }
    }

    set category(value: string) {
        if (this._category) {
            const categoryMap: { [key: string]: string } = {
                'дополнительное': 'card__category_additional',
                'кнопка': 'card__category_button',
                'софт-скил': 'card__category_soft',
                'хард-скил': 'card__category_hard',
                'другое': 'card__category_other',
            };
            this.setText(this._category, value);
            Object.values(categoryMap).forEach(cls => this._category!.classList.remove(cls)); 
            const mappedClass = categoryMap[value];
            if (mappedClass) {
                this._category.classList.add(mappedClass);
            }
        }

    }

    set description(value: string) {
        if (this._description) {
            this.setText(this._description, value);
        }
    }

    set inBasket(value: boolean) {
        if (this.buttonElement && !this.buttonElement.disabled) {
            if (value) {
                this.buttonElement.textContent = 'Удалить из корзины';
            } else {
                this.buttonElement.textContent = 'В корзину';
            }
        }
    }

    render( data:ICatalogCardData): HTMLElement {
        super.render({ title: data.title, price: data.price });
        if (data.image !== undefined) this.image = data.image;
        if (data.category !== undefined) this.category = data.category;
        if (data.description !== undefined) this.description = data.description;
        return this.container;
    }
}