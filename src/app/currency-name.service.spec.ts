import { TestBed } from '@angular/core/testing';

import { CurrencyNameService } from './currency-name.service';

describe('CurrencyNameService', () => {
  let service: CurrencyNameService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CurrencyNameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
