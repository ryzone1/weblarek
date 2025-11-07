import { IBuyer, TPayment } from '../../types/index';
import { IEvents } from '../base/Events'; // Добавляем импорт IEvents

export class BuyerModel {
  private payment: TPayment = '';
  private email: string = '';
  private phone: string = '';
  private address: string = '';

  constructor(private events: IEvents) {} // Принимаем брокер событий

  setPayment(payment: TPayment): void {
    this.payment = payment;
    // Генерируем событие при изменении оплаты
    this.events.emit('buyer:payment:changed', { payment: this.getData().payment });
  }

  setEmail(email: string): void {
    this.email = email;
    // Генерируем событие при изменении email
    this.events.emit('buyer:email:changed', { email: this.getData().email });
  }

  setPhone(phone: string): void {
    this.phone = phone;
    // Генерируем событие при изменении телефона
    this.events.emit('buyer:phone:changed', { phone: this.getData().phone });
  }

  setAddress(address: string): void {
    this.address = address;
    // Генерируем событие при изменении адреса
    this.events.emit('buyer:address:changed', { address: this.getData().address });
  }

  getData(): IBuyer {
    return {
      payment: this.payment,
      email: this.email,
      phone: this.phone,
      address: this.address,
    };
  }

  clear(): void {
    this.payment = '';
    this.email = '';
    this.phone = '';
    this.address = '';
    // Генерируем событие при очистке данных покупателя
    this.events.emit('buyer:cleared', { buyerData: this.getData() });
  }

  validate(): { [key in keyof IBuyer]?: string } {
    const errors: { [key in keyof IBuyer]?: string } = {};
    if (!this.payment) errors.payment = 'Не выбран вид оплаты';
    if (!this.email) errors.email = 'Укажите емэйл';
    if (!this.phone) errors.phone = 'Укажите телефон';
    if (!this.address) errors.address = 'Укажите адрес';
    return errors;
  }
}