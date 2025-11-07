import { IProduct } from '../../types/index';
import { IEvents } from '../base/Events'; // Добавляем импорт IEvents

export class CartModel {
  private items: IProduct[] = [];

  constructor(private events: IEvents) {} // Принимаем брокер событий

  getItems(): IProduct[] {
    return this.items;
  }

  addItem(product: IProduct): void {
    // Проверим, что товара ещё нет в корзине, чтобы избежать дубликатов (если это правило модели)
    if (!this.hasItem(product.id)) {
      this.items.push(product);
      // Генерируем событие при добавлении товара
      this.events.emit('cart:item:added', { item: product, items: this.getItems() });
    }
  }

  removeItem(product: IProduct): void {
    const index = this.items.findIndex(item => item.id === product.id);
    if (index !== -1) {
      this.items.splice(index, 1);
      // Генерируем событие при удалении товара
      this.events.emit('cart:item:removed', { item: product, items: this.getItems() });
    }
  }

  clear(): void {
    this.items = [];
    // Генерируем событие при очистке корзины
    this.events.emit('cart:cleared', { items: this.getItems() });
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