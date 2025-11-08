import { Component } from '../base/Component';
import { ensureElement } from '../../utils/utils';
import { IEvents } from '../base/Events';

interface IBaseFormData {
    errors: string[];
    valid: boolean;
}

export abstract class BaseForm<T extends IBaseFormData> extends Component<T> {
    protected errorsContainer: HTMLElement;
    protected submitButton: HTMLButtonElement;

    constructor(container: HTMLElement, protected events: IEvents, submitEventName: string) {
        super(container);
        this.errorsContainer = ensureElement<HTMLElement>('.form__errors', container);
        this.submitButton = ensureElement<HTMLButtonElement>('button[type="submit"]:not([name="card"]):not([name="cash"])', container);

        this.container.addEventListener('submit', (e) => {
            e.preventDefault();
            this.events.emit(submitEventName);
        });
    }

    set errors(value: string[]) {
        this.setText(this.errorsContainer, value.join('; '));
    }

    set valid(value: boolean) {
        this.submitButton.disabled = !value;
    }


    render( data:T): HTMLElement {
        super.render(data);
        if (data.errors !== undefined) this.errors = data.errors;
        if (data.valid !== undefined) this.valid = data.valid;
        return this.container;
    }
}