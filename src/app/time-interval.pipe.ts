import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeInterval',
})
export class TimeIntervalPipe implements PipeTransform {
  transform(value: number): string {
    const now = +new Date() / 1000;
    const diff = now - value;
    if (diff < 60) {
      return $localize`just now`;
    }
    if (diff < 3600) {
      return Math.floor(diff / 60) + $localize` minutes ago`;
    }
    if (diff < 86400) {
      return Math.floor(diff / 3600) + $localize` hours ago`;
    }
    return Math.floor(diff / 86400) + $localize` days ago`;
  }
}
