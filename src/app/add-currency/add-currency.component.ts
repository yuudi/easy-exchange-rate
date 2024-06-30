import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  templateUrl: './add-currency.component.html',
  styleUrls: ['./add-currency.component.scss'],
})
export class AddCurrencyComponent {
  searchText = '';

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { list: Readonly<string[]>; available: Readonly<string[]> },
  ) {}

  textContains(searchText: string, text: string | null): boolean {
    if (text === null) {
      return false;
    }
    searchText = searchText.toLowerCase();
    text = text.toLowerCase();
    let j = 0;
    for (let i = 0; i < text.length && j < searchText.length; i++) {
      if (searchText[j] === text[i]) {
        j++;
      }
    }
    return j === searchText.length;
  }
}
