import './scss/styles.scss';
import { API_URL } from './utils/constants';
import { EventEmitter, IEvents } from './components/base/Events';
import { Api } from './components/base/Api';
import { CatalogModel } from './components/Models/CatalogModel';
import { CartModel } from './components/Models/CartModel';
import { BuyerModel } from './components/Models/BuyerModel';
import { ApiService } from './components/Models/ApiService';
import { Modal } from './components/views/Modal';
import { Header } from './components/views/Header';
import { CatalogCard, BasketCard } from './components/views/Card';
import { Basket } from './components/views/Basket';
import { Order, Contacts } from './components/views/Order';
import { Success } from './components/views/Success';
import { ensureElement } from './utils/utils';
import { IProduct, TPayment, IBuyer } from './types/index';

const events: IEvents = new EventEmitter();

const api = new Api(API_URL);

const catalogModel = new CatalogModel(events);
const cartModel = new CartModel(events);
const buyerModel = new BuyerModel(events);

const apiService = new ApiService(api);

const headerContainer = ensureElement<HTMLElement>('.header');
const catalogContainer = ensureElement<HTMLElement>('.gallery');
const modalContainer = ensureElement<HTMLElement>('#modal-container');

const modal = new Modal(events, modalContainer);
const header = new Header(events, headerContainer);

events.on('catalog:products:changed', () => {
    const products = catalogModel.getProducts();
    const catalogCards = products.map((product) => {
        const clonedFragment = ensureElement<HTMLTemplateElement>('#card-catalog').content.cloneNode(true) as DocumentFragment;
        const cardContainer = clonedFragment.firstElementChild as HTMLElement;
        if (!cardContainer) {
            throw new Error('Шаблон #card-catalog пустой или не содержит элементов');
        }

        const cardComponent = new CatalogCard(
            cardContainer,
            events,
            {
                onClick: (event: MouseEvent) => {
                    event.preventDefault();
                    events.emit('catalog:item:click', { product });
                }
            }
        );
        cardComponent.render({
            id: product.id,
            title: product.title,
            image: product.image,
            price: product.price,
            category: product.category,
            description: product.description,
        });
        return cardComponent;
    });
    catalogContainer.replaceChildren(...catalogCards.map((card) => card.element));
});

events.on('cart:item:added', () => {
    header.counter = cartModel.getTotalCount();
});
events.on('cart:item:removed', () => {
    header.counter = cartModel.getTotalCount();
});
events.on('cart:cleared', () => {
    header.counter = cartModel.getTotalCount();
});

events.on('basket:open', () => {
    modal.closeModal();

    const basketView = new Basket(
        ensureElement<HTMLTemplateElement>('#basket').content.cloneNode(true) as HTMLElement,
        events
    );

    const basketItems = cartModel.getItems();
    const basketCards = basketItems.map((product, index) => {

         const clonedFragment = ensureElement<HTMLTemplateElement>('#card-basket').content.cloneNode(true) as DocumentFragment;
         const cardContainer = clonedFragment.firstElementChild as HTMLElement;
         if (!cardContainer) {
             throw new Error('Шаблон #card-basket пустой или не содержит элементов');
         }

        const cardComponent = new BasketCard(
            cardContainer,
            events,
            {
                onClick: (event: MouseEvent) => {
                    event.preventDefault();
                    events.emit('basket:item:delete', { product });
                }
            }
        );
        cardComponent.render({
            id: product.id,
            title: product.title,
            price: product.price,
            index: index + 1,
        });
        return cardComponent;
    });

    const cardElements = basketCards.map((card) => card.element);

    basketView.render({
        items: cardElements,
        total: cartModel.getTotalPrice(),
    });

    modal.openModal(basketView.element);
});

events.on('catalog:item:click', (data) => {
    const product = (data as { product: IProduct }).product;
    catalogModel.setSelectedProduct(product);

    const previewCard = new CatalogCard(
        ensureElement<HTMLTemplateElement>('#card-preview').content.cloneNode(true) as HTMLElement,
        events,
        {
            onClick: (event: MouseEvent) => {
                event.preventDefault();
                if (cartModel.hasItem(product.id)) {
                    cartModel.removeItem(product);
                    modal.closeModal();
                } else {
                    if (!cartModel.hasItem(product.id)) {
                        cartModel.addItem(product);
                        modal.closeModal();
                    }
                }
            }
        }
    );

    previewCard.render({
        id: product.id,
        title: product.title,
        image: product.image,
        price: product.price,
        category: product.category,
        description: product.description,
        inBasket: cartModel.hasItem(product.id)
    });

    modal.openModal(previewCard.element);
});

events.on('basket:item:delete', (data) => { 
    const product = (data as { product: IProduct }).product; 
    cartModel.removeItem(product);
    modal.closeModal();
    events.emit('basket:open');
});

events.on('order:open', () => {
    modal.closeModal();

    const clonedFragment = ensureElement<HTMLTemplateElement>('#order').content.cloneNode(true) as DocumentFragment;
    const orderContainer = clonedFragment.firstElementChild as HTMLElement;
    if (!orderContainer) {
        throw new Error('Шаблон #order пустой или не содержит элементов');
    }

    const orderView = new Order(
        orderContainer, 
        events
    );

    const buyerData = buyerModel.getData();
    orderView.render({
        payment: buyerData.payment,
        address: buyerData.address,
        errors: [],
        valid: false,
    });

    events.on('payment:change', (data) => {
        const payment = (data as { payment: TPayment }).payment;
        buyerModel.setPayment(payment);
        const currentBuyerData = buyerModel.getData();
        const orderErrors: Partial<Record<keyof IBuyer, string>> = {};
        if (!currentBuyerData.payment) orderErrors.payment = 'Не выбран вид оплаты';
        if (!currentBuyerData.address) orderErrors.address = 'Укажите адрес';

        orderView.errors = Object.values(orderErrors);
        orderView.valid = Object.keys(orderErrors).length === 0;
    });

    events.on('address:change', (data) => {
        const address = (data as { address: string }).address;
        buyerModel.setAddress(address);
        const currentBuyerData = buyerModel.getData();
        const orderErrors: Partial<Record<keyof IBuyer, string>> = {};
        if (!currentBuyerData.payment) orderErrors.payment = 'Не выбран вид оплаты';
        if (!currentBuyerData.address) orderErrors.address = 'Укажите адрес';

        orderView.errors = Object.values(orderErrors);
        orderView.valid = Object.keys(orderErrors).length === 0;
    });

    events.on('order:submit', () => {
        const currentBuyerData = buyerModel.getData();
        const orderErrors: Partial<Record<keyof IBuyer, string>> = {};
        if (!currentBuyerData.payment) orderErrors.payment = 'Не выбран вид оплаты';
        if (!currentBuyerData.address) orderErrors.address = 'Укажите адрес';

        if (Object.keys(orderErrors).length === 0) {
            events.emit('order:contacts:open');
        } else {
            orderView.errors = Object.values(orderErrors);
            orderView.valid = false;
        }
    });

    modal.openModal(orderView.element);
});

events.on('order:contacts:open', () => {
    modal.closeModal();
    const clonedFragment = ensureElement<HTMLTemplateElement>('#contacts').content.cloneNode(true) as DocumentFragment;
    const contactsContainer = clonedFragment.firstElementChild as HTMLElement;
    if (!contactsContainer) {
        throw new Error('Шаблон #contacts пустой или не содержит элементов');
    }

    const contactsView = new Contacts(
        contactsContainer,
        events
    );

    const buyerData = buyerModel.getData();
    contactsView.render({
        email: buyerData.email,
        phone: buyerData.phone,
        errors: [],
        valid: false,
    });

    events.on('email:change', (data) => {
        const email = (data as { email: string }).email;
        buyerModel.setEmail(email);
        const currentBuyerData = buyerModel.getData();
        const contactErrors: Partial<Record<keyof IBuyer, string>> = {};
        if (!currentBuyerData.email) contactErrors.email = 'Укажите емэйл';
        if (!currentBuyerData.phone) contactErrors.phone = 'Укажите телефон';

        contactsView.errors = Object.values(contactErrors);
        contactsView.valid = Object.keys(contactErrors).length === 0;
    });

    events.on('phone:change', (data) => {
        const phone = (data as { phone: string }).phone;
        buyerModel.setPhone(phone);
        const currentBuyerData = buyerModel.getData();
        const contactErrors: Partial<Record<keyof IBuyer, string>> = {};
        if (!currentBuyerData.email) contactErrors.email = 'Укажите емэйл';
        if (!currentBuyerData.phone) contactErrors.phone = 'Укажите телефон';

        contactsView.errors = Object.values(contactErrors);
        contactsView.valid = Object.keys(contactErrors).length === 0;
    });

    events.on('contacts:submit', () => {
        const currentBuyerData = buyerModel.getData();
        const contactErrors: Partial<Record<keyof IBuyer, string>> = {};
        if (!currentBuyerData.email) contactErrors.email = 'Укажите емэйл';
        if (!currentBuyerData.phone) contactErrors.phone = 'Укажите телефон';

        if (Object.keys(contactErrors).length === 0) {
            const orderData = buyerModel.getData();
            const cartItems = cartModel.getItems();
            const orderToSend = {
                ...orderData,
                total: cartModel.getTotalPrice(),
                items: cartItems.map(item => item.id)
            };

            apiService.sendOrder(orderToSend)
                .then(result => {
                    cartModel.clear();
                    buyerModel.clear();
                    events.emit('order:success', { total: result.total });
                })
                .catch(error => {
                    console.error('Ошибка при отправке заказа:', error);
                });
        } else {
            contactsView.errors = Object.values(contactErrors);
            contactsView.valid = false;
        }
    });

    modal.openModal(contactsView.element);
});
events.on('order:success', (data) => { 
    const total = (data as { total: number }).total;
    modal.closeModal();

    const successView = new Success(
        ensureElement<HTMLTemplateElement>('#success').content.cloneNode(true) as HTMLElement,
        events
    );

    successView.render({ total });

    events.on('success:close', () => {
        modal.closeModal();
    });

    modal.openModal(successView.element);
});

events.on('modal:close', () => {
});

apiService.getProducts()
    .then((products) => {
        catalogModel.setProducts(products);
        header.counter = cartModel.getTotalCount();
    })
    .catch((error) => {
        console.error('Ошибка при загрузке каталога:', error);
    });
