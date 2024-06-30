import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { AddCurrencyComponent } from './add-currency/add-currency.component';
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
  focus: number | null = null;
  lastUpdated = 0;
  installable = false;
  isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  private installFunc = () => {};

  constructor(
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
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

    iconRegistry.addSvgIcon(
      'github',
      sanitizer.bypassSecurityTrustResourceUrl(
        'assets/icons/github-mark-white.svg',
      ),
    );
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
    const fragment = window.location.hash;
    const query = fragment.split('?')[1];
    if (!query) {
      return;
    }
    const queryParams: { [key: string]: string | undefined } = {};
    query.split('&').forEach((pair) => {
      const [key, value] = pair.split('=');
      queryParams[key] = value;
    });
    const value = queryParams['value'];
    const fromCurrency = queryParams['fromCurrency'];
    if (!fromCurrency) {
      return;
    }
    if (Object.hasOwn(this.currencyRate, fromCurrency)) {
      this.tmpCurrencyList.push(fromCurrency);
    }
    const currencyValue = value ? +value : 100;
    this.valueUSD = currencyValue / this.currencyRate[fromCurrency];
    this.empty = false;
    const toCurrency = queryParams['toCurrency'];
    if (toCurrency) {
      const toCurrentList = toCurrency.split(',');
      toCurrentList.forEach((currency) => {
        if (Object.hasOwn(this.currencyRate, currency)) {
          this.tmpCurrencyList.push(currency);
        }
      });
    }
    // clear the uri hash
    history.replaceState(null, '', window.location.href.split('#')[0]);
  }
  valueChanged(value: number) {
    this.valueUSD = value;
  }
  installClicked() {
    this.installFunc();
  }
  editClicked() {
    const dialog = this.dialog.open(ListComponent, {
      data: {
        list: this.currencyList.slice(), // shallow copy
      },
      width: '100%',
      maxWidth: '30em',
    });
    dialog.afterClosed().subscribe((result) => {
      if (result) {
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
  addCurrencyClicked() {
    const dialog = this.dialog.open(AddCurrencyComponent, {
      data: {
        list: this.currencyList,
        available: Object.keys(this.currencyRate),
      },
      width: '100%',
      maxWidth: '30em',
    });
    dialog.afterClosed().subscribe((result) => {
      if (result) {
        this.currencyList.push(result);
        localStorage.setItem('CURRENCY', JSON.stringify(this.currencyList));
      }
    });
  }
}
