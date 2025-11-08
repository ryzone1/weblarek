import { IProduct } from '../../types/index';
import { IEvents } from '../base/Events';

export class CatalogModel {
  private products: IProduct[] = [];
  private selectedProduct: IProduct | null = null;

  constructor(private events: IEvents) {}

  setProducts(products: IProduct[]): void {
    this.products = products;
    this.events.emit('catalog:products:changed', { products: this.getProducts() });
  }

  getProducts(): IProduct[] {
    return this.products;
  }

  getProductById(id: string): IProduct | null {
    return this.products.find(product => product.id === id) || null;
  }

  setSelectedProduct(product: IProduct | null): void {
    this.selectedProduct = product;
    this.events.emit('catalog:selected:changed', { selectedProduct: this.getSelectedProduct() });
  }

  getSelectedProduct(): IProduct | null {
    return this.selectedProduct;
  }
}