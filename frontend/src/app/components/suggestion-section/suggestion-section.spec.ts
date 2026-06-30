import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuggestionSection } from './suggestion-section';

describe('SuggestionSection', () => {
  let component: SuggestionSection;
  let fixture: ComponentFixture<SuggestionSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuggestionSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuggestionSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
