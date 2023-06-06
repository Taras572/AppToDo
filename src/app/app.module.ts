import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginingComponent } from './pages/logining/logining.component';
import { HomeComponent } from './pages/home/home.component';
import { StatisticsComponent } from './pages/statistics/statistics.component';
import { SettingsProfileComponent } from './pages/settings-profile/settings-profile.component';
import { CatComponent } from './pages/cat/cat.component';


import { environment } from '../environments/environment';
import { provideFirebaseApp } from '@angular/fire/app';
import { getApp, initializeApp } from 'firebase/app';

import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { getMessaging } from "firebase/messaging";

import { provideStorage } from '@angular/fire/storage';
import { provideDatabase } from '@angular/fire/database';
import { provideAuth } from '@angular/fire/auth';
import { provideMessaging } from '@angular/fire/messaging';
import { ToastrModule } from 'ngx-toastr';







@NgModule({
  declarations: [
    AppComponent,
    LoginingComponent,
    HomeComponent,
    StatisticsComponent,
    SettingsProfileComponent,
    CatComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideStorage(() => getStorage(getApp(), 'anotherBucket')),
    provideDatabase(() => getDatabase()),
    provideAuth(() => getAuth()),
    provideMessaging(()=> getMessaging())
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
