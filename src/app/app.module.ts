import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { HttpClientModule } from '@angular/common/http';
import { NgModule, isDevMode } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { AppComponent } from './app.component';
import { CurrencyComponent } from './currency/currency.component';
import { ListComponent } from './list/list.component';
import { TimeIntervalPipe } from './time-interval.pipe';

const serviceWorkerModuleWithProvider = ServiceWorkerModule.register(
  'ngsw-worker.js',
  {
    enabled: !isDevMode(),
    // Register the ServiceWorker as soon as the application is stable
    // or after 30 seconds (whichever comes first).
    registrationStrategy: 'registerWhenStable:30000',
  },
);

@NgModule({
  declarations: [
    AppComponent,
    CurrencyComponent,
    ListComponent,
    TimeIntervalPipe,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    serviceWorkerModuleWithProvider,
    HttpClientModule,
    FormsModule,
    MatToolbarModule,
    MatListModule,
    MatFormFieldModule,
    MatMenuModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatDialogModule,
    CdkDropList,
    CdkDrag,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
