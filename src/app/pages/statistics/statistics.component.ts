import { Component } from '@angular/core';
import { SettingsProfileService } from 'src/app/shared/services/settings/settings-profile.service';
import { child, get, onValue, push, ref, remove, set, update } from 'firebase/database';
import { Database } from '@angular/fire/database';
import { UsersService } from 'src/app/shared/services/users/users.service';
import { setting, task } from 'src/app/shared/model/users/users.module';
import { of } from 'rxjs';

@Component({
    selector: 'app-statistics',
    templateUrl: './statistics.component.html',
    styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent {

    public countStyle!: string;
    public personInfo: any;
    public finishedTask!: number;
    public unfinishedTask!: number;
    public allTask!: number;
    public progress!:number;

    public test!:any;

    constructor(
        public userService: UsersService,
        public db: Database,
        public settingService: SettingsProfileService
    ) { }

    ngOnInit(): void {
        this.getUid();
    }

    getUid(): void {
        if (localStorage.getItem('userToDo')) {
            this.personInfo = JSON.parse(<string>localStorage.getItem('userToDo'));
            this.loadUser(this.personInfo.uid);
        }
    }

    loadUser(item: string) {
        this.userService.load(item).subscribe(elem => { 
            this.finishedTask = elem.finishedTask;
                this.unfinishedTask = elem.unfinishedTask;
                this.allTask = Object.values(elem.task).length;
                this.progress = this.checkTask(Object.values(elem.task));
                this.test = Object.values(elem.task);
                this.countStyle = this.settingService.colorApp(elem.setting.style);
        })
    }

    checkTask(item: Array<task>): number {
        let count = 0;
        item.forEach(value=>{
            if(!value.complete) count++
        })
        return count;
    }


}

