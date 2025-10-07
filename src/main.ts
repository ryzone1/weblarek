import './scss/styles.scss';
import { apiProducts } from './utils/data';
import { BuyerModel } from './components/base/Models/BuyerModel';
import { CartModel} from './components/base/Models/CartModel';
import { CatalogModel } from './components/base/Models/CatalogModel';
import { Api } from './components/base/Api';
import { ApiService } from './components/base/Models/ApiService';
import { API_URL } from './utils/constants';

console.log('Тест CatalogModel');
const catalogModel = new CatalogModel();
catalogModel.setProducts(apiProducts.items);
console.log('Все товары в каталоге:', catalogModel.getProducts());

const firstProduct = apiProducts.items[0];
catalogModel.setSelectedProduct(firstProduct);
console.log('Выбранный товар:', catalogModel.getSelectedProduct());

const productId = firstProduct.id;
console.log(`Товар с id ${productId}:`, catalogModel.getProductById(productId));

console.log('Тест CartModel');
const cartModel = new CartModel();

const product1 = apiProducts.items[0];
const product2 = apiProducts.items[1];
cartModel.addItem(product1);
cartModel.addItem(product2);

console.log('Товары в корзине:', cartModel.getItems());
console.log('Общее количество товаров в корзине:', cartModel.getTotalCount());
console.log('Общая цена товаров в корзине:', cartModel.getTotalPrice());

console.log(`Товар с id ${product1.id} в корзине:`, cartModel.hasItem(product1.id));

cartModel.removeItem(product1);
console.log('Товары в корзине после удаления:', cartModel.getItems());

cartModel.clear();
console.log('Корзина после очистки:', cartModel.getItems());

console.log('Тест BuyerModel');
const buyerModel = new BuyerModel();

buyerModel.setPayment('card');
buyerModel.setEmail('example@test.com');
buyerModel.setPhone('+71234567890');
buyerModel.setAddress('ул. Пушкина, д. Колотушкина');

console.log('Данные покупателя:', buyerModel.getData());

console.log('Ошибки валидации (ожидается пустой объект):', buyerModel.validate());

buyerModel.clear();
console.log('Данные покупателя после очистки:', buyerModel.getData());

console.log('Ошибки валидации после очистки:', buyerModel.validate());

const api = new Api(API_URL);
const apiService = new ApiService(api);

apiService.getProducts()
    .then(products => {
        catalogModel.setProducts(products);
        console.log('Полученный каталог:', catalogModel.getProducts());
    })
    .catch(error => {
        console.error('Ошибка при получении товаров:', error);
    });
