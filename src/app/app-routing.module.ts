import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginingComponent } from './pages/logining/logining.component';
import { StatisticsComponent } from './pages/statistics/statistics.component';
import { SettingsProfileComponent } from './pages/settings-profile/settings-profile.component';
import { AuthGuard } from './guards/auth.guard';



const routes: Routes = [
  { path: '', component: LoginingComponent },
  { path: 'logining', component: LoginingComponent },
  { path: 'statistic', component: StatisticsComponent, canActivate: [AuthGuard] },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard]},
  { path: 'setting', component: SettingsProfileComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
