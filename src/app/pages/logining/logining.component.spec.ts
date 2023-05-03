import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginingComponent } from './logining.component';

describe('LoginingComponent', () => {
  let component: LoginingComponent;
  let fixture: ComponentFixture<LoginingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoginingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
