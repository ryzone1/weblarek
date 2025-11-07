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

// --- Инициализация приложения ---

// 1. Создаём брокер событий
const events: IEvents = new EventEmitter();

// 2. Создаём API
const api = new Api(API_URL);

// 3. Создаём модели, передавая брокер событий
const catalogModel = new CatalogModel(events);
const cartModel = new CartModel(events);
const buyerModel = new BuyerModel(events);

// 4. Создаём API-сервис
const apiService = new ApiService(api);

// 5. Находим контейнеры в DOM для представлений
const headerContainer = ensureElement<HTMLElement>('.header');
const catalogContainer = ensureElement<HTMLElement>('.gallery');
const modalContainer = ensureElement<HTMLElement>('#modal-container');

// 6. Создаём представления, передавая контейнеры и брокер событий
const modal = new Modal(events, modalContainer);
const header = new Header(events, headerContainer);

// --- Презентер (AppPresenter) логика в main.ts ---

// --- Подписки на события Моделей ---

// 1. Обработка изменения списка товаров в каталоге
events.on('catalog:products:changed', () => {
    const products = catalogModel.getProducts();
    const catalogCards = products.map((product) => {
        // Клонируем содержимое шаблона
        const clonedFragment = ensureElement<HTMLTemplateElement>('#card-catalog').content.cloneNode(true) as DocumentFragment;
        // Берём первый дочерний элемент фрагмента - это и есть наша кнопка-карточка
        const cardContainer = clonedFragment.firstElementChild as HTMLElement;
        if (!cardContainer) {
            throw new Error('Шаблон #card-catalog пустой или не содержит элементов');
        }

        const cardComponent = new CatalogCard(
            cardContainer, // <-- Передаём кнопку, а не фрагмент
            events,
            {
                onClick: (event: MouseEvent) => {
                    // event.preventDefault(); // Убираем preventDefault, если не нужно
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
    catalogContainer.replaceChildren(...catalogCards.map((card) => card.element)); // card.element теперь кнопка
});

// 2. Обработка изменения содержимого корзины
events.on('cart:item:added', () => {
    header.counter = cartModel.getTotalCount();
});
events.on('cart:item:removed', () => {
    header.counter = cartModel.getTotalCount();
});
events.on('cart:cleared', () => {
    header.counter = cartModel.getTotalCount();
});

// 3. Обработка изменения данных покупателя (пока не требует прямого ререндера, но можно подписаться для обновления валидности форм)

// --- Подписки на события Представлений ---

// 1. Открытие корзины
// 3. Открытие корзины
// В main.ts, обработчик basket:open
// 3. Открытие корзины
events.on('basket:open', () => {
    modal.closeModal();

    const basketView = new Basket(
        ensureElement<HTMLTemplateElement>('#basket').content.cloneNode(true) as HTMLElement,
        events
    );

    // Получаем товары из корзины и создаём для них карточки
    const basketItems = cartModel.getItems();
    console.log('DEBUG: basketItems при открытии корзины:', basketItems);
    const basketCards = basketItems.map((product, index) => {
         console.log('DEBUG: Создаю BasketCard для', product.title);

         // --- ИСПРАВЛЕНИЕ ---
         // Клонируем содержимое шаблона #card-basket
         const clonedFragment = ensureElement<HTMLTemplateElement>('#card-basket').content.cloneNode(true) as DocumentFragment;
         // Берём первый дочерний элемент фрагмента - это и есть наш li.basket__item
         const cardContainer = clonedFragment.firstElementChild as HTMLElement;
         if (!cardContainer) {
             throw new Error('Шаблон #card-basket пустой или не содержит элементов');
         }

        const cardComponent = new BasketCard(
            cardContainer, // <-- Передаём li.basket__item, а не DocumentFragment
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
        console.log('DEBUG: BasketCard.render завершён для', product.title);
        return cardComponent;
    });

    console.log('DEBUG: Список basketCards готов, длина:', basketCards.length);
    // Теперь card.element будет li.basket__item, а не DocumentFragment
    const cardElements = basketCards.map((card) => card.element);
    console.log('DEBUG: Элементы карточек (типы):', cardElements.map(el => el.tagName)); // <-- Отладка типа элемента

    basketView.render({
        items: cardElements,
        total: cartModel.getTotalPrice(),
    });
    console.log('DEBUG: basketView.render завершён');

    modal.openModal(basketView.element);
    console.log('DEBUG: modal.openModal вызван');
});

// 2. Клик по карточке каталога (открытие превью)
events.on('catalog:item:click', (data) => {
    const product = (data as { product: IProduct }).product;
    catalogModel.setSelectedProduct(product);

    const previewCard = new CatalogCard(
        ensureElement<HTMLTemplateElement>('#card-preview').content.cloneNode(true) as HTMLElement,
        events,
        {
            onClick: (event: MouseEvent) => {
                event.preventDefault();
                // Проверяем, находится ли товар в корзине
                if (cartModel.hasItem(product.id)) {
                    // Если товар в корзине, удаляем его
                    cartModel.removeItem(product);
                    // Закрываем модальное окно после удаления
                    modal.closeModal();
                } else {
                    // Если товара нет в корзине, добавляем его
                    if (!cartModel.hasItem(product.id)) {
                        cartModel.addItem(product);
                        // Закрываем модальное окно после добавления
                        modal.closeModal();
                    }
                }
            }
        }
    );

    // Рендерим карточку с учётом, находится ли товар в корзине
    // Добавим в ICatalogCard поле, например, inBasket: boolean
    previewCard.render({
        id: product.id,
        title: product.title,
        image: product.image,
        price: product.price,
        category: product.category,
        description: product.description,
        // Передаём статус "в корзине" в render
        inBasket: cartModel.hasItem(product.id)
    });

    modal.openModal(previewCard.element);
});

// 3. Удаление товара из корзины
events.on('basket:item:delete', (data) => { // Принимаем data как object
    const product = (data as { product: IProduct }).product; // Приводим тип
    cartModel.removeItem(product);
    modal.closeModal();
    events.emit('basket:open'); // Обновляем содержимое корзины
});

// 4. Открытие формы заказа (шаг 1)
events.on('order:open', () => {
    modal.closeModal();

    // Клонируем содержимое шаблона #order
    const clonedFragment = ensureElement<HTMLTemplateElement>('#order').content.cloneNode(true) as DocumentFragment;
    // Берём первый дочерний элемент фрагмента - это и есть наша <form class="form" name="order">
    const orderContainer = clonedFragment.firstElementChild as HTMLElement;
    if (!orderContainer) {
        throw new Error('Шаблон #order пустой или не содержит элементов');
    }

    const orderView = new Order(
        orderContainer, // <-- Передаём <form>, а не DocumentFragment
        events
    );

    // ... (остальной код для orderView.render и подписок)
    const buyerData = buyerModel.getData();
    orderView.render({
        payment: buyerData.payment,
        address: buyerData.address,
        errors: [],
        valid: false,
    });

    // Подписываемся на события формы
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

// 6. Открытие формы контактов (шаг 2)
events.on('order:contacts:open', () => {
    modal.closeModal();

    // Клонируем содержимое шаблона #contacts
    const clonedFragment = ensureElement<HTMLTemplateElement>('#contacts').content.cloneNode(true) as DocumentFragment;
    // Берём первый дочерний элемент фрагмента - это и есть наша <form class="form" name="contacts">
    const contactsContainer = clonedFragment.firstElementChild as HTMLElement;
    if (!contactsContainer) {
        throw new Error('Шаблон #contacts пустой или не содержит элементов');
    }

    const contactsView = new Contacts(
        contactsContainer, // <-- Передаём <form>, а не DocumentFragment
        events
    );

    // ... (остальной код для contactsView.render и подписок)
    const buyerData = buyerModel.getData();
    contactsView.render({
        email: buyerData.email,
        phone: buyerData.phone,
        errors: [],
        valid: false,
    });

    // Подписываемся на события формы
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
// 6. Успешное оформление заказа
events.on('order:success', (data) => { // Принимаем data как object
    const total = (data as { total: number }).total; // Приводим тип
    modal.closeModal();

    const successView = new Success(
        ensureElement<HTMLTemplateElement>('#success').content.cloneNode(true) as HTMLElement,
        events
    );

    successView.render({ total });

    // Подписываемся на закрытие окна успеха
    events.on('success:close', () => {
        modal.closeModal();
        // Можно сбросить состояние заказа, если нужно
    });

    modal.openModal(successView.element);
});

// 7. Закрытие модального окна
events.on('modal:close', () => {
    // Можно сбросить состояние форм при закрытии, если нужно
    // events.emit('order:form:reset');
});

// --- Запуск приложения ---
apiService.getProducts()
    .then((products) => {
        // Устанавливаем продукты в модель, это вызовет событие 'catalog:products:changed'
        catalogModel.setProducts(products);
        // Счётчик корзины обновится автоматически через события от CartModel
        header.counter = cartModel.getTotalCount();
    })
    .catch((error) => {
        console.error('Ошибка при загрузке каталога:', error);
        // Можно показать сообщение об ошибке пользователю
    });
