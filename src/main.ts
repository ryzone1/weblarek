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
import { CatalogCard } from './components/views/CatalogCard';
import { BasketCard } from './components/views/BasketCard';
import { Basket } from './components/views/Basket';
import { Order } from './components/views/Order';
import { Contacts } from './components/views/Contact';
import { Success } from './components/views/Success';
import { ensureElement, cloneTemplate } from './utils/utils';
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

const basketView = new Basket(
    cloneTemplate<HTMLElement>('#basket'),
    events
);

const orderView = new Order(
    cloneTemplate<HTMLElement>('#order'),
    events
);

const contactsView = new Contacts(
    cloneTemplate<HTMLElement>('#contacts'),
    events
);

const successView = new Success(
    cloneTemplate<HTMLElement>('#success'),
    events
);

let currentBasketViewActive: boolean = false;
let currentOrderViewActive: boolean = false;
let currentContactsViewActive: boolean = false;

const unsubscribeOrderView = () => {
    if (currentOrderViewActive) {
        currentOrderViewActive = false;
    }
};

const unsubscribeContactsView = () => {
    if (currentContactsViewActive) {
        currentContactsViewActive = false;
    }
};

const showOrderContacts = () => {
    if (currentOrderViewActive) {
        unsubscribeOrderView();
    }
    modal.closeModal();

    currentContactsViewActive = true;

    const buyerData = buyerModel.getData();
    contactsView.render({
        email: buyerData.email,
        phone: buyerData.phone,
        errors: [],
        valid: false,
    });

    modal.openModal(contactsView.element);
};


const handleCatalogSelectedChanged = (data) => {
    const selectedProduct = (data as { selectedProduct: IProduct | null }).selectedProduct;
    if (selectedProduct) {
        console.log('DEBUG: catalog:selected:changed, открытие превью для', selectedProduct.title);

        const previewCard = new CatalogCard(
            cloneTemplate<HTMLElement>('#card-preview'),
            events,
            {
                onClick: (event: MouseEvent) => {
                    console.log('DEBUG: CatalogCard onClick (fallback) для товара', selectedProduct.title);
                    event.preventDefault();
                }
            }
        );

        previewCard.render({
            id: selectedProduct.id,
            title: selectedProduct.title,
            image: selectedProduct.image,
            price: selectedProduct.price,
            category: selectedProduct.category,
            description: selectedProduct.description,
        });

        const buttonElement = previewCard.element.querySelector('.card__button') as HTMLButtonElement;
        if (buttonElement) {
            if (cartModel.hasItem(selectedProduct.id)) {
                buttonElement.textContent = 'Удалить из корзины';
                buttonElement.onclick = (event: MouseEvent) => {
                    event.preventDefault();
                    cartModel.removeItem(selectedProduct);
                    modal.closeModal();
                };
            } else {
                if (!buttonElement.disabled) {
                        buttonElement.textContent = 'В корзину';
                        buttonElement.onclick = (event: MouseEvent) => {
                        event.preventDefault();
                        if (!cartModel.hasItem(selectedProduct.id)) {
                            cartModel.addItem(selectedProduct);
                        }
                        modal.closeModal();
                }
            }
        } 
        }

        modal.openModal(previewCard.element);
    }
};

const handleOrderModelPaymentChange = (data) => {
    if (currentOrderViewActive) {
        orderView.payment = data.payment;
        validateOrderForm();
    }
};

const handleOrderModelAddressChange = (data) => {
    if (currentOrderViewActive) {
        orderView.address = data.address;
        validateOrderForm();
    }
};


const handleContactsModelEmailChange = (data) => {
    if (currentContactsViewActive) {
        contactsView.email = data.email;
        validateContactsForm();
    }
};

const handleContactsModelPhoneChange = (data) => {
    if (currentContactsViewActive) {
        contactsView.phone = data.phone;
        validateContactsForm();
    }
};

events.on('catalog:selected:changed', handleCatalogSelectedChanged);
events.on('buyer:payment:changed', handleOrderModelPaymentChange);
events.on('buyer:address:changed', handleOrderModelAddressChange);
events.on('buyer:email:changed', handleContactsModelEmailChange);
events.on('buyer:phone:changed', handleContactsModelPhoneChange);

const validateOrderForm = () => {
    if (currentOrderViewActive) {
        const allErrors = buyerModel.validate();

        const isPaymentValid = !allErrors.payment;
        const isAddressValid = !allErrors.address;
        const isFormValidForOrder = isPaymentValid && isAddressValid;

        const orderFormSpecificErrors: Partial<Record<keyof IBuyer, string>> = {};
        if (allErrors.payment) orderFormSpecificErrors.payment = allErrors.payment;
        if (allErrors.address) orderFormSpecificErrors.address = allErrors.address;

        orderView.errors = Object.values(orderFormSpecificErrors);
        orderView.valid = isFormValidForOrder;
    }
};

const validateContactsForm = () => {
    if (currentContactsViewActive) {
        const errors = buyerModel.validate();

        const isEmailValid = !errors.email;
        const isPhoneValid = !errors.phone;

        const isFormValidForContacts = isEmailValid && isPhoneValid;

        const contactsFormSpecificErrors: Partial<Record<keyof IBuyer, string>> = {};
        if (errors.email) contactsFormSpecificErrors.email = errors.email;
        if (errors.phone) contactsFormSpecificErrors.phone = errors.phone;

        contactsView.errors = Object.values(contactsFormSpecificErrors);
        contactsView.valid = isFormValidForContacts;
    }
};

events.on('catalog:products:changed', () => {
    const products = catalogModel.getProducts();
    const catalogCards = products.map((product) => {
        const cardContainer = cloneTemplate<HTMLButtonElement>('#card-catalog');

        const cardComponent = new CatalogCard(
            cardContainer,
            events,
            {
                onClick: (event: MouseEvent) => {
                    console.log('DEBUG: Клик на карточку каталога!');
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

events.on('catalog:item:click', (data) => {
    const product = (data as { product: IProduct }).product;
    catalogModel.setSelectedProduct(product);
});

events.on(/^cart:/, () => { 
    header.counter = cartModel.getTotalCount();
    if (currentBasketViewActive) {
        console.log('DEBUG: cart:* event, корзина открыта, обновляем содержимое.');
        const basketItems = cartModel.getItems();
        const basketCards = basketItems.map((product, index) => {
            const cardContainer = cloneTemplate<HTMLElement>('#card-basket');

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
    }
});

events.on('basket:open', () => {
    currentBasketViewActive = true;

    const basketItems = cartModel.getItems();
    const basketCards = basketItems.map((product, index) => {
        const cardContainer = cloneTemplate<HTMLElement>('#card-basket');

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

events.on('basket:item:delete', (data) => {
    const product = (data as { product: IProduct }).product;
    cartModel.removeItem(product);
});

events.on('order:open', () => {
    currentOrderViewActive = true;

    const buyerData = buyerModel.getData();
    orderView.render({
        payment: buyerData.payment,
        address: buyerData.address,
        errors: [],
        valid: false,
    });

    modal.openModal(orderView.element);
});
events.on('order:step1:validated', () => {
    if (currentOrderViewActive) {
        unsubscribeOrderView();
    }
    modal.closeModal();

    currentContactsViewActive = true;

    const buyerData = buyerModel.getData();
    contactsView.render({
        email: buyerData.email,
        phone: buyerData.phone,
        errors: [],
        valid: false,
    });

    modal.openModal(contactsView.element);
});

events.on('order:success', (data) => {
    const total = (data as { total: number }).total;
    if (currentContactsViewActive) {
        unsubscribeContactsView();
    }
    modal.closeModal();

    successView.render({ total });

    events.on('success:close', () => {
        modal.closeModal();
    });

    modal.openModal(successView.element);
});

events.on('modal:close', () => {
    if (currentBasketViewActive) currentBasketViewActive = false;
    if (currentOrderViewActive) {
        unsubscribeOrderView();
    }
    if (currentContactsViewActive) {
        unsubscribeContactsView();
    }
    document.body.classList.remove('page_locked');
});

events.on('modal:open', () => {
    document.body.classList.add('page_locked');
});

events.on('payment:method:selected', (data) => {
    const payment = (data as { payment: TPayment }).payment;
    buyerModel.setPayment(payment);
});

events.on('address:change', (data) => {
    const address = (data as { address: string }).address;
    buyerModel.setAddress(address);
});

events.on('email:change', (data) => {
    const email = (data as { email: string }).email;
    buyerModel.setEmail(email);
});

events.on('phone:change', (data) => {
    const phone = (data as { phone: string }).phone;
    buyerModel.setPhone(phone);
});

events.on('order:submit', () => {
    console.log('DEBUG: Обработчик order:submit в main.ts сработал');
    const errors = buyerModel.validate();
    const isFormValidForSubmit = !errors.payment && !errors.address;

    if (isFormValidForSubmit) {
        showOrderContacts();
    } else {
        const allErrors = buyerModel.validate();
        const orderFormSpecificErrors: Partial<Record<keyof IBuyer, string>> = {};
        if (allErrors.payment) orderFormSpecificErrors.payment = allErrors.payment;
        if (allErrors.address) orderFormSpecificErrors.address = allErrors.address;

        orderView.errors = Object.values(orderFormSpecificErrors);
        orderView.valid = false;
    }
});

events.on('contacts:submit', () => {
    const errors = buyerModel.validate();
    const isFormValidForSubmit = !errors.email && !errors.phone;

    if (isFormValidForSubmit) {
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
                showSuccess(result.total);
            })
            .catch(error => {
                console.error('Ошибка при отправке заказа:', error);
            });
    } else {
        const allErrors = buyerModel.validate();
        const contactsFormSpecificErrors: Partial<Record<keyof IBuyer, string>> = {};
        if (allErrors.email) contactsFormSpecificErrors.email = allErrors.email;
        if (allErrors.phone) contactsFormSpecificErrors.phone = allErrors.phone;

        contactsView.errors = Object.values(contactsFormSpecificErrors);
        contactsView.valid = false;
    }
});

const showSuccess = (total: number) => {
    if (currentContactsViewActive) {
        unsubscribeContactsView();
    }
    modal.closeModal();

    successView.render({ total });

    events.on('success:close', () => {
        modal.closeModal();
    });

    modal.openModal(successView.element);
};

apiService.getProducts()
    .then((products) => {
        catalogModel.setProducts(products);
        header.counter = cartModel.getTotalCount();
    })
    .catch((error) => {
        console.error('Ошибка при загрузке каталога:', error);
    });