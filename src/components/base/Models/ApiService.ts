import { IApi, IProduct, IProductListResponse, IOrder, IOrderResult } from '../../../types/index';

export class ApiService {
    constructor(private api: IApi) {}

    getProducts(): Promise<IProduct[]> {
        return this.api.get<IProductListResponse>('/product/')
            .then(response => response.items);
    }

    sendOrder(order: IOrder): Promise<IOrderResult> {
        return this.api.post<IOrderResult>('/order', order);
    }
}