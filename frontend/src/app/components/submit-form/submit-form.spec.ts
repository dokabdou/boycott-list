import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitForm } from './submit-form';

describe('SubmitForm', () => {
  let component: SubmitForm;
  let fixture: ComponentFixture<SubmitForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmitForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmitForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
