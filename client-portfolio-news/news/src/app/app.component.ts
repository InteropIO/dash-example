import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DataService } from './data.service';
import { Glue42Service } from './glue.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public news: any[] = [];
  public selectedNewsId;
  public relevantTo: string;

  constructor(
    private readonly dataService: DataService,
    private readonly glueService: Glue42Service,
    private ref: ChangeDetectorRef
  ) { }

  public async ngOnInit(): Promise<void> {
    this.news = await this.dataService.getNews();

    this.glueService.subscribeToSelectedClient(({ clientId }) => this.handleClientContext(clientId));
  }

  public handleNewsCardClicked(newsId: string): void {
    this.selectedNewsId = this.selectedNewsId === newsId ? null : newsId;
  }

  private async handleClientContext(clientId: string): Promise<void> {
    if (clientId) {
      this.news = await this.dataService.getClientRelatedNews(clientId);
      const { firstName, lastName } = await this.dataService.getClientById(clientId);
      this.relevantTo = `${firstName} ${lastName}`;
      this.selectedNewsId = '';

      this.ref.detectChanges();
      return;
    }
  }
}
