import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemManageComponent } from './item-manage.component';

describe('ItemManageComponent', () => {
  let component: ItemManageComponent;
  let fixture: ComponentFixture<ItemManageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ItemManageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemManageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
