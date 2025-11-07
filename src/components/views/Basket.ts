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
        // Очищаем список
        this.list.replaceChildren(...items);
        // Показываем/скрываем список и сообщение в зависимости от количества элементов
        if (items.length === 0) {
            this.list.hidden = true; // Скрываем список
            this.emptyMessageElement.hidden = false; // Показываем сообщение
            this.button.disabled = true; // Делаем кнопку "Оформить" неактивной
        } else {
            this.list.hidden = false; // Показываем список
            this.emptyMessageElement.hidden = true; // Скрываем сообщение
            this.button.disabled = false; // Делаем кнопку "Оформить" активной
        }
    }

set total(value: number) {
    console.log('DEBUG: Basket.set total вызван с', value); // <-- Отладка
    this.setText(this.totalElement, `${value} синапсов`);
}

    render(data: IBasketData): HTMLElement {
        super.render(data);
        this.items = data.items;
        this.total = data.total;
        return this.container;
    }
}