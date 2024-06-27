import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyNameService } from './currency-name.service';

@Pipe({
  name: 'currencyName',
})
export class CurrencyNamePipe implements PipeTransform {
  constructor(private currencyName: CurrencyNameService) {}

  transform(currencyCode: string): Promise<string> {
    return this.currencyName.getName(currencyCode);
  }
}
