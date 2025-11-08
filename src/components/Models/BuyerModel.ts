import { IBuyer, TPayment } from '../../types/index';
import { IEvents } from '../base/Events';

export class BuyerModel {
  private data: IBuyer = {
      payment: '',
      email: '',
      phone: '',
      address: '',
  };

  constructor(private events: IEvents) {}

  setPayment(payment: TPayment): void {
    this.data.payment = payment;
    this.events.emit('buyer:payment:changed', { payment: this.data.payment });
  }

  setEmail(email: string): void {
    this.data.email = email;
    this.events.emit('buyer:email:changed', { email: this.data.email });
  }

  setPhone(phone: string): void {
    this.data.phone = phone;
    this.events.emit('buyer:phone:changed', { phone: this.data.phone });
  }

  setAddress(address: string): void {
    this.data.address = address;
    console.log('DEBUG: BuyerModel.setAddress вызван, новое значение:', address); 
    this.events.emit('buyer:address:changed', { address: this.data.address });
  }

  getData(): IBuyer {
    return { ...this.data };
  }

  clear(): void {
    this.data = {
        payment: '',
        email: '',
        phone: '',
        address: '',
    };
  }

  validate(): { [key in keyof IBuyer]?: string } {
    const errors: { [key in keyof IBuyer]?: string } = {};
    if (!this.data.payment) errors.payment = 'Не выбран вид оплаты';
    if (!this.data.email) errors.email = 'Укажите емэйл';
    if (!this.data.phone) errors.phone = 'Укажите телефон';
    if (!this.data.address) errors.address = 'Укажите адрес';
    return errors;
  }
}