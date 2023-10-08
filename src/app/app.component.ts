import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

type RATES = { [key: string]: number };

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  // Hard code for now
  currencyList = ['USD', 'CNY', 'JPY', 'HKD', 'TWD', 'EUR'];
  currencyRate: RATES = {};
  valueUSD = 100;
  empty = true;

  constructor(private http: HttpClient) {}
  ngOnInit() {
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
        .subscribe(({ updated, rates }) => {
          this.currencyRate = rates;
          rate = {
            updated,
            fetched: now,
            rates,
          };
          localStorage.setItem('RATES', JSON.stringify(rate));
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
}
