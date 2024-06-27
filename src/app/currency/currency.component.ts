import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-currency',
  templateUrl: './currency.component.html',
  styleUrls: ['./currency.component.scss'],
})
export class CurrencyComponent implements OnChanges {
  @Input() code = '';
  @Input() rate? = 1;
  @Input() valueUSD = 0;
  @Output() valueUSDChange = new EventEmitter<number>();
  @Input() empty = true;
  @Output() emptyChange = new EventEmitter<boolean>();
  @Input() decimal_places = 10000;
  @Input() show_close = false;
  @Output() choose = new EventEmitter<void>();

  value: number | null = null;
  placeholder = '';

  valueChanged() {
    if (this.rate === undefined) {
      return;
    }
    if (this.value === null) {
      this.valueUSDChange.emit(100 / this.rate);
      this.emptyChange.emit(true);
    } else {
      this.valueUSDChange.emit(this.value / this.rate);
      this.emptyChange.emit(false);
    }
  }
  ngOnChanges() {
    if (this.rate === undefined) {
      return;
    }
    const value =
      Math.round(this.valueUSD * this.rate * this.decimal_places) /
      this.decimal_places;
    if (this.empty) {
      this.value = null;
      this.placeholder = value.toString();
    } else {
      this.value = value;
    }
  }
  fieldFocused() {
    this.choose.emit();
    if (this.rate !== undefined && this.empty) {
      this.valueUSDChange.emit(100 / this.rate);
    }
  }
}
