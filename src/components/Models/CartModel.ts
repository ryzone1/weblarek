import { IProduct } from '../../types/index';
import { IEvents } from '../base/Events';

export class CartModel {
  private items: IProduct[] = [];

  constructor(private events: IEvents) {} 

  getItems(): IProduct[] {
    return this.items;
  }

  addItem(product: IProduct): void {
    if (!this.hasItem(product.id)) {
      this.items.push(product);
      this.events.emit('cart:changed', { items: this.getItems() });
    }
  }

  removeItem(product: IProduct): void {
    const index = this.items.findIndex(item => item.id === product.id);
    if (index !== -1) {
      this.items.splice(index, 1);
      this.events.emit('cart:changed', { items: this.getItems() });
    }
  }

  clear(): void {
    this.items = [];
    this.events.emit('cart:changed', { items: this.getItems() });
  }

  getTotalPrice(): number {
    return this.items.reduce((sum, item) => {
      return sum + (item.price || 0);
    }, 0);
  }

  getTotalCount(): number {
    return this.items.length;
  }

  hasItem(id: string): boolean {
    return this.items.some(item => item.id === id);
  }
}