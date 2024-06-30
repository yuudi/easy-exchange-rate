import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

const availableLanguages = ['en-us', 'zh-cn'] as const;

@Injectable({
  providedIn: 'root',
})
export class CurrencyNameService {
  private names;
  private resolve?: (value: Map<string, string>) => void;

  constructor(private http: HttpClient) {
    this.names = new Promise<Map<string, string>>((resolve) => {
      this.resolve = resolve;
    });
    this.fetchCurrencyNames();
  }

  private getUserLanguage() {
    const userLanguages = navigator.languages;
    for (const userLanguage of userLanguages) {
      const language = userLanguage.toLowerCase();
      for (const availableLanguage of availableLanguages) {
        if (availableLanguage.startsWith(language)) {
          return availableLanguage;
        }
      }
    }
    return availableLanguages[0];
  }

  private fetchCurrencyNames() {
    const userLanguage = this.getUserLanguage();
    this.http
      .get('/assets/currencies.csv', { responseType: 'text' })
      .subscribe({
        next: (data) => {
          const lines = data.split('\n');
          const [, ...languages] = lines[0].split(',');
          const languageIndex = languages.indexOf(userLanguage);
          const nameMap = new Map<string, string>();
          for (const line of lines.slice(1)) {
            const [code, ...names] = line.split(',');
            const name = names[languageIndex];
            nameMap.set(code, name);
          }
          this.resolve?.(nameMap);
        },
        error: (error) => {
          alert('Failed to fetch currency names ' + error);
        },
      });
  }

  public getName(currencyCode: string): Promise<string> {
    return this.names.then((names) => names.get(currencyCode) || currencyCode);
  }
}
