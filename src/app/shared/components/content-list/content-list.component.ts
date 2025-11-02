import {ProgressSpinner} from 'primeng/progressspinner';
import {
  AfterContentInit,
  Component,
  computed,
  ContentChild,
  ContentChildren,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  QueryList,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import {ClCellTemplateDirective, ClEmptyTemplateDirective, ClHeaderDirective,} from './content-list-directives';
import {NgTemplateOutlet} from '@angular/common';
import {Paginator, PaginatorState} from 'primeng/paginator';
import {Checkbox} from 'primeng/checkbox';
import {FormsModule} from '@angular/forms';
import {Message} from 'primeng/message';
import {animate, query, stagger, style, transition, trigger} from '@angular/animations';

export interface IItemListContent<T> {
  cellTemplate: ClCellTemplateDirective<T>;
  headerRef: ClHeaderDirective;
}

export interface ISelectedItem<T> {
  checked: boolean,
  item?: T;
}

export const listAnimation = trigger('listAnimation', [
  transition(':enter', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(20px)' }),
      stagger(100, [ // 100ms de atraso entre cada item
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ], { optional: true })
  ]),
  transition(':leave', [
    animate('200ms ease-in', style({ opacity: 0, transform: 'translateX(50px)' }))
  ])
]);

@Component({
  standalone: true,
  selector: 'app-content-list',
  imports: [
    NgTemplateOutlet,
    Paginator,
    Checkbox,
    FormsModule,
    ProgressSpinner,
    Message
  ],
  templateUrl: './content-list.component.html',
  styleUrl: './content-list.component.scss',
  animations: [listAnimation]
})
export class ContentList<T> implements AfterContentInit {
  public isMobile: InputSignal<boolean> = input(false);
  public paginator: InputSignal<boolean> = input(false);
  public selectable: InputSignal<boolean> = input(false);
  public needPress: InputSignal<boolean> = input(false);
  public disabled: InputSignal<boolean> = input(false);
  public canSelectFn: InputSignal<(item: T) => boolean> = input((item: T): boolean => true);
  public isLoading: InputSignal<boolean> = input(false);
  public dataList: InputSignal<T[]> = input.required();
  public first: InputSignal<number> = input(0);
  public rows: InputSignal<number> = input(0);
  public totalRecords: InputSignal<number> = input(0);
  public rowsPerPageOptions: InputSignal<number[]> = input([10, 20, 30]);
  public gridClass: InputSignal<string> = input("flex");
  public onPageChange: OutputEmitterRef<PaginatorState> = output();
  public viewList: WritableSignal<IItemListContent<T>[]> = signal([]);
  public actionCell?: ClCellTemplateDirective<T>;
  public selectAll: boolean = false;
  public mobilePressed: WritableSignal<boolean> = signal(false);
  public showMobileCheck: Signal<boolean> = computed(() => this.selectable() && (this.needPress()?this.mobilePressed():true));
  public selectionList: InputSignal<T[]> = input(new Array<T>());
  public selectionListChange: OutputEmitterRef<(T | undefined)[]> = output();
  public selectionItemList: ISelectedItem<T>[] = [];

  public dataSignal: Signal<T[]> = computed(() => {
    const data: T[] = this.dataList();
    this.selectionItemList = data.map((item: T) => {
      return {
        checked: this.selectionList().includes(item),
        item: this.selectionList().includes(item) ? item : undefined
      };
    });

    this.selectAll = this.selectionItemList.length > 0 && this.selectionItemList.every(i => i.checked);
    return data;
  });

  @ContentChildren(ClCellTemplateDirective) private cellsTemplates!: QueryList<ClCellTemplateDirective<T>>;
  @ContentChildren(ClHeaderDirective) private headersElements!: QueryList<ClHeaderDirective>;
  @ContentChild(ClEmptyTemplateDirective) public emptyTemplate!: ClEmptyTemplateDirective;

  public ngAfterContentInit(): void {
    const auxList: IItemListContent<T>[] = [];
    this.cellsTemplates.toArray().forEach((cellT: ClCellTemplateDirective<T>, index: number) => {
      const header: ClHeaderDirective | undefined = this.headersElements.get(index);
      if (header) auxList.push({
          cellTemplate: cellT,
          headerRef: header
      });

      if (cellT.isAction()) this.actionCell = cellT;
    });
    this.viewList.set(auxList)

    if (this.selectable()) this.initSelectionList();
  }

  public canSelect(item: T): boolean {
    return this.canSelectFn()(item);
  }

  private initSelectionList(): void {
    for(let i = 0; i < this.dataList().length; i++) {
      this.selectionItemList.push({
        checked: false,
        item: undefined
      });
    }

    // add value in items from input
    this.selectionList().forEach((item:T) => {
      const index: number = this.dataList().indexOf(item);
      if (index >= 0) {
        this.selectionItemList[index].checked = true;
        this.selectionItemList[index].item = item;
      }
    });
  }

  private notifySelecionChange(): void {
    const checkeds = this.selectionItemList.filter((item:ISelectedItem<T>) => item.checked).map(item => item.item);
    this.selectionListChange.emit(checkeds);
  }

  private verifyAll(): void {
    const checkableItems = this.dataList().filter(item => this.canSelect(item));
    const selectedItems = this.selectionItemList.filter(
      (item, index) => item.checked && this.canSelect(this.dataList()[index])
    );

    this.selectAll = checkableItems.length === selectedItems.length;
    this.notifySelecionChange();
  }

  public pageChange(event: PaginatorState): void {
    this.onPageChange.emit(event);
  }

  private pressTimer: any;

  // TODO increase method performance
  public onTouchStart(event: TouchEvent): void {
    if (!this.mobilePressed() && this.needPress()) {
      this.pressTimer = setTimeout(() => {
        this.mobilePressed.set(true);
      }, 1000);
    }
  }

  public onTouchEnd(event: TouchEvent): void {
    if (this.needPress()) clearTimeout(this.pressTimer);
  }

  public toggleSelectAll(): void {
    this.selectionItemList.forEach((item: ISelectedItem<T>, index: number) => {
      const currentItem = this.dataList()[index];
      const isSelectable = this.canSelect(currentItem);

      if (isSelectable) {
        item.checked = this.selectAll;
        item.item = this.selectAll ? currentItem : undefined;
      }
    });
    this.notifySelecionChange();
  }

  public selectItem(index: number, item: T): void {
    let auxItem: ISelectedItem<T> = this.selectionItemList[index];
    if (auxItem.checked) auxItem.item = item;
    else auxItem.item = undefined;

    this.selectionItemList[index] = auxItem;
    this.verifyAll();
  }
}
