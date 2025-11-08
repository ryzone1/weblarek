import { Component } from '../base/Component';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';

interface IModalData {
    content: HTMLElement;
}

export class Modal extends Component<IModalData> {
    protected closeButton: HTMLButtonElement;
    protected contentContainer: HTMLElement;
    private escapeHandler: (event: KeyboardEvent) => void;

    constructor(protected events: IEvents, container: HTMLElement) {
        super(container);
        this.closeButton = ensureElement<HTMLButtonElement>('.modal__close', container);
        this.contentContainer = ensureElement<HTMLElement>('.modal__content', container);
        this.escapeHandler = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                this.closeModal();
            }
        };

        this.closeButton.addEventListener('click', this.closeModal.bind(this));
        this.container.addEventListener('mousedown', (event: MouseEvent) => {
            if (event.target === this.container) {
                this.closeModal();
            }
        });

    }

    closeModal(): void {
        this.container.classList.remove('modal_active');
        this.events.emit('modal:close');
        document.removeEventListener('keydown', this.escapeHandler);
    }

    openModal(content: HTMLElement): void {
        this.contentContainer.replaceChildren(content);
        this.container.classList.add('modal_active');
        this.events.emit('modal:open');
        document.addEventListener('keydown', this.escapeHandler);
    }

    render( data: IModalData): HTMLElement {
        super.render(data);
        this.openModal(data.content);
        return this.container;
    }
}