import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ListComponent } from './list/list.component';

type RATES = { [key: string]: number };

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  currencyList: string[] = [];
  currencyRate: RATES = {};
  valueUSD = 100;
  empty = true;

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
  ) {}
  ngOnInit() {
    const currencyJson = localStorage.getItem('CURRENCY');
    if (currencyJson !== null) {
      this.currencyList = JSON.parse(currencyJson);
    } else {
      this.currencyList = ['USD', 'EUR', 'JPY', 'CNY', 'KRW', 'HKD', 'TWD'];
    }

    const rateJson = localStorage.getItem('RATES');
    let rate: {
      updated: number;
      fetched: number;
      rates: RATES;
    };
    if (rateJson !== null) {
      rate = JSON.parse(rateJson);
      this.currencyRate = rate.rates;
    } else {
      rate = { updated: 0, fetched: 0, rates: {} };
    }
    const now = +new Date() / 1000;
    if (now - rate.updated > 86400 && now - rate.fetched > 3600) {
      this.http
        .get<{ updated: number; rates: RATES }>(
          'https://api.exchange-rate.yuudi.dev/exchange-rate.json',
        )
        .subscribe({
          next: ({ updated, rates }) => {
            this.currencyRate = rates;
            rate = {
              updated,
              fetched: now,
              rates,
            };
            localStorage.setItem('RATES', JSON.stringify(rate));
          },
          error: () => {
            alert('Failed to fetch exchange rate');
          },
        });
    }
  }
  valueChanged(value: number) {
    this.valueUSD = value;
  }
  clearClicked() {
    this.valueUSD = 100;
    this.empty = true;
  }
  settingsClicked() {
    const dialog = this.dialog.open(ListComponent, {
      data: {
        list: this.currencyList.slice(), // shallow copy
        available: Object.keys(this.currencyRate),
      },
      width: '100%',
      maxWidth: '30em',
    });
    dialog.afterClosed().subscribe((result) => {
      if (result !== undefined) {
        this.currencyList = result;
        localStorage.setItem('CURRENCY', JSON.stringify(result));
      }
    });
  }
  shareClicked() {
    navigator.share({
      title: 'Easy Exchange Rate',
      url: window.location.href,
    });
  }
}
