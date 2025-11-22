import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpponentCardComponent } from './opponent-card.component';

describe('OpponentCardComponent', () => {
  let component: OpponentCardComponent;
  let fixture: ComponentFixture<OpponentCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpponentCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OpponentCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
