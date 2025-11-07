import { Component } from '../base/Component';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';

interface IModalData {
    content: HTMLElement;
}

export class Modal extends Component<IModalData> {
    protected closeButton: HTMLButtonElement;
    protected contentContainer: HTMLElement;

    constructor(protected events: IEvents, container: HTMLElement) {
        super(container);
        this.closeButton = ensureElement<HTMLButtonElement>('.modal__close', container);
        this.contentContainer = ensureElement<HTMLElement>('.modal__content', container);

        this.closeButton.addEventListener('click', this.closeModal.bind(this));
        this.container.addEventListener('mousedown', (event: MouseEvent) => {
            if (event.target === this.container) {
                this.closeModal();
            }
        });
        // Закрытие по Escape
        document.addEventListener('keydown', (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    closeModal(): void {
        this.container.classList.remove('modal_active');
        document.body.classList.remove('page_locked');
        this.events.emit('modal:close');
    }

    openModal(content: HTMLElement): void {
        this.contentContainer.replaceChildren(content);
        this.container.classList.add('modal_active');
        document.body.classList.add('page_locked');
        this.events.emit('modal:open');
    }

    // Исправленный синтаксис: data: IModalData
    render( data: IModalData): HTMLElement {
        super.render(data); // Вызов базового render для совместимости
        this.openModal(data.content); // Используем переданное содержимое
        return this.container;
    }
}