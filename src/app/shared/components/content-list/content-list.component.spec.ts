import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentList } from './content-list.component';

describe('ContentListComponent', () => {
  let component: ContentList<any>;
  let fixture: ComponentFixture<ContentList<any>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContentList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
