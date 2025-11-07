import { Component } from '../base/Component';
import { ensureElement } from '../../utils/utils';
import { IEvents } from '../base/Events';
import { CDN_URL } from '../../utils/constants';

// categoryMap теперь внутри этого файла (или импортирован)
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
    // Правильные типы | null для опциональных элементов
    protected imageElement: HTMLImageElement | null;
    protected _price: HTMLElement; // Цена есть в обоих шаблонах, используем ensureElement
    protected _category: HTMLElement | null;
    protected _description: HTMLElement | null; // Нет в #card-catalog, используем querySelector
    protected button: HTMLButtonElement | null; // Нет в #card-catalog, используем querySelector

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
            this.setText(this._price, 'Бесценно'); // Или другой текст для null
            this._price.classList.add('card__price-disabled');
            // Если кнопка существует, блокируем её и меняем текст
            if (this.button) {
                this.button.disabled = true; // Блокируем кнопку
                this.setText(this.button, 'Недоступно'); // Меняем текст
                // Обработчик клика не будет срабатывать на disabled кнопке
            }
        } else {
            this.setText(this._price, `${value} синапсов`);
            this._price.classList.remove('card__price-disabled');
        }}

    set category(value: string | undefined) {
        // Проверяем, существует ли элемент _category перед его модификацией
        if (this._category) {
            if (value) {
                this.setText(this._category, value);
                // Удаляем все возможные классы категорий
                Object.values(categoryMap).forEach(cls => this._category!.classList.remove(cls)); // ! потому что if выше проверил
                // Добавляем класс для текущей категории, если он есть в карте
                const mappedClass = categoryMap[value];
                if (mappedClass) {
                    this._category.classList.add(mappedClass);
                }
            } else {
                // Если value undefined, очищаем текст и удаляем все классы категорий
                this.setText(this._category, '');
                Object.values(categoryMap).forEach(cls => this._category!.classList.remove(cls));
            }
        }
        // Если this._category === null (например, для BasketCard), просто игнорируем
    }

    set description(value: string | undefined) {
        if (this._description) {
            this.setText(this._description, value || '');
        }
    }

     set inBasket(value: boolean) {
        if (this.button) { // Проверяем, существует ли кнопка (например, в #card-preview)
            if (value) {
                this.setText(this.button, 'Удалить из корзины'); // Изменяем текст
            } else {
                this.setText(this.button, 'В корзину'); // Восстанавливаем текст
            }
        }
    }
}

// --- Классы для конкретных представлений карточек ---

interface ICatalogCard extends ICardBase {
    id: string;
}

// --- Классы для конкретных представлений карточек ---

interface ICatalogCard extends ICardBase {
    id: string;
}

export class CatalogCard extends Card {
    constructor(
        container: HTMLElement,
        events: IEvents,
        actions?: { onClick: (event: MouseEvent) => void }
    ) {
        super(container, events, actions); // Передаём events и actions дальше
    }

    // Правильный синтаксис:  data: ICatalogCard
    override render(data: ICatalogCard): HTMLElement {
        super.render(data); // Вызов базового render
        // ID не устанавливается как поле в Card, но можно использовать data.id при необходимости
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
    protected deleteButton: HTMLButtonElement; // Удаление в корзине всегда есть

    constructor(
        container: HTMLElement,
        events: IEvents,
        actions?: { onClick: (event: MouseEvent) => void }
    ) {
        super(container, events, actions);
        // Эти элементы должны быть в шаблоне BasketCard (#card-basket), используем ensureElement
        this.deleteButton = ensureElement<HTMLButtonElement>('.basket__item-delete', container); // В шаблоне #card-basket есть .basket__item-delete
        this.indexElement = ensureElement<HTMLElement>('.basket__item-index', container); // В шаблоне #card-basket есть .basket__item-index

        if (actions?.onClick) {
            this.deleteButton.addEventListener('click', actions.onClick);
        }
    }

    set index(value: number) {
        this.setText(this.indexElement, String(value));
    }

    // Правильный синтаксис:  data: IBasketCard
    override render(data: IBasketCard): HTMLElement {
        super.render(data); // Вызов базового render
        this.title = data.title;
        this.price = data.price;
        if (data.index !== undefined) {
            this.index = data.index;
        }
        return this.container;
    }
}