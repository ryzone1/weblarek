import { Component } from '../base/Component';
import { ensureElement } from '../../utils/utils';
import { IEvents } from '../base/Events';

interface ISuccessData {
    total: number;
}

export class Success extends Component<ISuccessData> {
    protected closeSuccessButton: HTMLButtonElement;
    protected description: HTMLElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);
        this.closeSuccessButton = ensureElement<HTMLButtonElement>('.order-success__close', container);
        this.description = ensureElement<HTMLElement>('.order-success__description', container);

        this.closeSuccessButton.addEventListener('click', () => {
            events.emit('success:close');
        });
    }

    set total(value: number) {
        this.setText(this.description, `Списано ${value} синапсов`);
    }

    render(data: ISuccessData): HTMLElement {
        super.render(data);
        this.total = data.total;
        return this.container;
    }
}