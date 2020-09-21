import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class DataService {
  constructor(private http: HttpClient) { }

  public getNews(): Promise<any> {
    return this.http.get('/api/news').toPromise();
  }

  public async getStockBySymbol(stockSymbol): Promise<any> {
    const stocks = await this.http.get<any>('/api/stocks').toPromise();

    const stock = stocks.find(({ symbol }) => symbol === stockSymbol);

    return Promise.resolve(stock);
  }

  public async getClientById(id: string): Promise<any> {
    const clients = await this.http.get<any>('/api/clients').toPromise();

    const client = clients.find(({ id: clientId }) => clientId === id);

    return Promise.resolve(client);
  }

  public async getClientRelatedNews(clientId: string): Promise<any[]> {
    const news = await this.getNews();

    return news.filter((n) => n.relatedTo.clientIds.some((id) => id === clientId));
  }

  public async getStockRelatedNews(symbol: string): Promise<any> {
    const news = await this.getNews();

    return news.filter((n) => n.relatedTo.stockSymbols.some((s) => s === symbol));
  }
}
