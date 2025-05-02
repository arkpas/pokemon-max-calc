import { TestBed } from '@angular/core/testing';

import { MaxCalculatorService } from './max-calculator.service';

describe('MaxCalculatorService', () => {
  let service: MaxCalculatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MaxCalculatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
