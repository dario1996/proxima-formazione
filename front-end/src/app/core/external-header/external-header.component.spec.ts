import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalHeaderComponent } from './external-header.component';

describe('ExternalHeaderComponent', () => {
  let component: ExternalHeaderComponent;
  let fixture: ComponentFixture<ExternalHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExternalHeaderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExternalHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
