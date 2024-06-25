import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { list: string[]; available: string[] },
  ) {}

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.data.list, event.previousIndex, event.currentIndex);
  }

  delete(index: number) {
    this.data.list.splice(index, 1);
  }

  add(item: string) {
    this.data.list.push(item);
  }
}
