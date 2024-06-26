import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ListComponent } from './list/list.component';

type RATES = { [key: string]: number };

// This is a non-standard event, only available in Chrome
// It is not in the TypeScript definition
// https://developer.mozilla.org/en-US/docs/Web/API/BeforeInstallPromptEvent
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BeforeInstallPrompt = any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  tmpCurrencyList: string[] = [];
  currencyList: string[] = [];
  currencyRate: RATES = {};
  valueUSD = 100;
  empty = true;
  lastUpdated = 0;
  installable = false;
  isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  installFunc = () => {};

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
  ) {
    window.addEventListener('beforeinstallprompt', (e: BeforeInstallPrompt) => {
      e.preventDefault();
      this.installable = true;
      this.installFunc = () => {
        this.installable = false;
        e.prompt();
      };
    });
  }
  ngOnInit() {
    // Load currency list and exchange rate from localStorage
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
      this.lastUpdated = rate.updated;
    } else {
      rate = { updated: 0, fetched: 0, rates: {} };
    }
    const now = +new Date() / 1000;
    // Fetch exchange rate if it is older than 1 day
    if (now - rate.updated > 86400 && now - rate.fetched > 3600) {
      this.http
        .get<{
          updated: number;
          rates: RATES;
        }>('https://api.exchange-rate.yuudi.dev/exchange-rate.json')
        .subscribe({
          next: ({ updated, rates }) => {
            this.currencyRate = rates;
            this.lastUpdated = updated;
            rate = {
              updated,
              fetched: now,
              rates,
            };
            localStorage.setItem('RATES', JSON.stringify(rate));
            this.getPresetValue();
          },
          error: () => {
            alert('Failed to fetch exchange rate');
          },
        });
    } else {
      this.getPresetValue();
    }
  }
  private getPresetValue() {
    // Get value from uri
    const uri = new URL(location.href);
    const value = uri.searchParams.get('value');
    const fromCurrency = uri.searchParams.get('fromCurrency');
    if (value !== null && fromCurrency !== null) {
      if (!this.currencyList.includes(fromCurrency)) {
        this.tmpCurrencyList.push(fromCurrency);
      }
      this.valueUSD = +value / this.currencyRate[fromCurrency];
      this.empty = false;
      const toCurrency = uri.searchParams.get('toCurrency');
      if (toCurrency !== null) {
        const toCurrentList = toCurrency.split(',');
        toCurrentList.forEach((currency) => {
          if (!this.currencyList.includes(currency)) {
            this.tmpCurrencyList.push(currency);
          }
        });
      }
      // clear the uri search params
      history.replaceState(null, '', location.pathname);
    }
  }
  valueChanged(value: number) {
    this.valueUSD = value;
  }
  clearClicked() {
    this.valueUSD = 100;
    this.empty = true;
  }
  installClicked() {
    this.installFunc();
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
