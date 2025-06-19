import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NegozioSwitcherComponent } from './negozio-switcher.component';

describe('NegozioSwitcherComponent', () => {
  let component: NegozioSwitcherComponent;
  let fixture: ComponentFixture<NegozioSwitcherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NegozioSwitcherComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NegozioSwitcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
