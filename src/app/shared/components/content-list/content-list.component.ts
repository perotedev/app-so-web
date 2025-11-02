import { ProgressSpinner } from 'primeng/progressspinner';
import {
  AfterContentInit,
  Component, computed, ContentChild,
  ContentChildren,
  input,
  InputSignal, output, OutputEmitterRef,
  QueryList, signal, Signal, WritableSignal,
} from '@angular/core';
import {
  ClCellTemplateDirective,
  ClEmptyTemplateDirective,
  ClHeaderDirective,
} from './content-list-directives';
import {NgTemplateOutlet} from '@angular/common';
import {Paginator, PaginatorState} from 'primeng/paginator';
import {Checkbox} from 'primeng/checkbox';
import {FormsModule} from '@angular/forms';
import {Message} from 'primeng/message';
import {animate, query, stagger, style, transition, trigger} from '@angular/animations';

export interface IItemListContent {
  cellTemplate: ClCellTemplateDirective;
  headerRef: ClHeaderDirective;
}

export interface ISelectedItem {
  checked: boolean,
  item: any;
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
export class ContentList implements AfterContentInit {
  public isMobile: InputSignal<boolean> = input(false);
  public paginator: InputSignal<boolean> = input(false);
  public selectable: InputSignal<boolean> = input(false);
  public needPress: InputSignal<boolean> = input(false);
  public disabled: InputSignal<boolean> = input(false);
  public canSelectFn: InputSignal<(item: any) => boolean> = input((item: any): boolean => true);
  public isLoading: InputSignal<boolean> = input(false);
  public dataList: InputSignal<any[]> = input.required();
  public first: InputSignal<number> = input(0);
  public rows: InputSignal<number> = input(0);
  public totalRecords: InputSignal<number> = input(0);
  public rowsPerPageOptions: InputSignal<number[]> = input([10, 20, 30]);
  public gridClass: InputSignal<string> = input("flex");
  public onPageChange: OutputEmitterRef<PaginatorState> = output();
  public viewList: WritableSignal<IItemListContent[]> = signal([]);
  public actionCell: ClCellTemplateDirective | undefined;
  public selectAll: boolean = false;
  public mobilePressed: WritableSignal<boolean> = signal(false);
  public showMobileCheck: Signal<boolean> = computed(() => this.selectable() && (this.needPress()?this.mobilePressed():true));
  public selectionList: InputSignal<any[]> = input(new Array<any>());
  public selectionListChange: OutputEmitterRef<any[]> = output();
  public selectionItemList: ISelectedItem[] = [];

  @ContentChildren(ClCellTemplateDirective) private cellsTemplates!: QueryList<ClCellTemplateDirective>;
  @ContentChildren(ClHeaderDirective) private headersElements!: QueryList<ClHeaderDirective>;
  @ContentChild(ClEmptyTemplateDirective) public emptyTemplate!: ClEmptyTemplateDirective;


  public ngAfterContentInit(): void {
    const auxList: IItemListContent[] = [];
    this.cellsTemplates.toArray().forEach((cellT: ClCellTemplateDirective, index: number) => {
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

  private initSelectionList(): void {
    for(let i = 0; i < this.dataList().length; i++) {
      this.selectionItemList.push({
        checked: false,
        item: undefined
      });
    }

    // add value in items from input
    this.selectionList().forEach((item:any) => {
      const index: number = this.dataList().indexOf(item);
      if (index >= 0) {
        this.selectionItemList[index].checked = true;
        this.selectionItemList[index].item = item;
      }
    });
  }

  private notifySelecionChange(): void {
    const checkeds = this.selectionItemList.filter((item:ISelectedItem) => item.checked).map(item => item.item);
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
    this.selectionItemList.forEach((item: ISelectedItem, index: number) => {
      const currentItem = this.dataList()[index];
      const isSelectable = this.canSelect(currentItem);

      if (isSelectable) {
        item.checked = this.selectAll;
        item.item = this.selectAll ? currentItem : undefined;
      }
    });
    this.notifySelecionChange();
  }

  public selectItem(index: number, item: any): void {
    let auxItem: ISelectedItem = this.selectionItemList[index];
    if (auxItem.checked) auxItem.item = item;
    else auxItem.item = undefined;

    this.selectionItemList[index] = auxItem;
    this.verifyAll();
  }

  public dataSignal = computed(() => {
    const data = this.dataList();
    this.selectionItemList = data.map(item => {
      return {
        checked: this.selectionList().includes(item),
        item: this.selectionList().includes(item) ? item : undefined
      };
    });

    this.selectAll = this.selectionItemList.length > 0 && this.selectionItemList.every(i => i.checked);
    return data;
  });

  public canSelect(item: any): boolean {
    return this.canSelectFn()(item);
  }

  // para passar o checkbox condicional, crie uma função no componente pai:

  // public itemSelectable = (item: any): boolean => {
  //   return item?.condicao === 'CONDICAO';
  // };

  // e passe a condição como bind no component de content-list:

  // <pf-content-list
  //   [selectable]="true"
  //   [canSelectFn]="itemSelectable"
}
