import { Component } from '@angular/core';
import { UsersService } from 'src/app/shared/services/users/users.service';
import { ref, remove, set, update } from 'firebase/database';
import { Database } from '@angular/fire/database';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { task, user } from 'src/app/shared/model/users/users.module';
import { SettingsProfileService } from 'src/app/shared/services/settings/settings-profile.service';


@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent {

    public edit_block: boolean = true;
    public add_block: boolean = true;
    public personInfo: any;

    public userCount: Array<user> = [];
    public task: Array<task> = [];
    public taskID!: string;
    public taskForm!: UntypedFormGroup;
    public testStyle!: string;
    public countStyle!: string;

    public days: Array<any> = [];


    constructor(
        public userService: UsersService,
        public db: Database,
        private fb: UntypedFormBuilder,
        public settingService: SettingsProfileService
    ) {

    }


    ngOnInit(): void {
        this.initTasks();
        this.getUid();
        this.settingService.colorApp$.subscribe(elem => this.countStyle = elem);
        this.days = this.settingService.week();
        this.userService.edit$.subscribe(elem => { this.edit_block = elem });
        let Filter = require('bad-words'), filter = new Filter();
        console.log(filter.clean("Don't be an ash0le beach suck my dick"));

        let test = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjJkM2E0YTllYjY0OTk0YzUxM2YyYzhlMGMwMTY1MzEzN2U5NTg3Y2EiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiWmVmaXIiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUFjSFR0Y2toUFZkcWMtdkdBYnJLWFRuSDZtZ1dIUTJKVXRGcndpbkVWbFU1Zz1zOTYtYyIsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbS90b2RvbGlzdC0yMzllMiIsImF1ZCI6InRvZG9saXN0LTIzOWUyIiwiYXV0aF90aW1lIjoxNjg1MzUyNzk0LCJ1c2VyX2lkIjoiOElKaEZmMVZLYmd1MW9XTXFQMVdVVXZrTjIwMiIsInN1YiI6IjhJSmhGZjFWS2JndTFvV01xUDFXVVV2a04yMDIiLCJpYXQiOjE2ODUzNTI3OTQsImV4cCI6MTY4NTM1NjM5NCwiZW1haWwiOiIxOXplZmlyQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7Imdvb2dsZS5jb20iOlsiMTA2MjgwMDE3NTE0NjQzOTEyNTkxIl0sImVtYWlsIjpbIjE5emVmaXJAZ21haWwuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoiZ29vZ2xlLmNvbSJ9fQ.Q7Rtih4Zfgc98SxF1Yi3oRrTQDoK-RbjTqIs-8lmYQZYm9Xy-PCieI_GuoPC1IKpvx8vfqxKJiMQj3op9EuEbEQ5ktl6ohKBcgbAJGq8WfQU7EHq4IalZrJlt2L9gPF0RSNg6SYYc-fqRPBNFbLfMZM6iHKVwI85O-43zIrKNzezPLW-0aFpiDE_ivXSc6HTPueTt0Et9K6V05bcDKybOczjMUIT7Qje2OqkGmbwk-Lx_oneqCdkc4db2XSLPpMxRZjW13Tq1waj9R-NO8-ppzqPYn6YlP8atj7Azj8zXPNRmkWTwu6i-pVsvUE5VLUgDQkHz6iE11sMJ7M2PKGY2w"
    }


    initTasks(): void {
        this.taskForm = this.fb.group({
            text: [null],
            dataFinish: [null]
        });
    }


    logOut() {
        localStorage.removeItem('userToDo');
    }


    getUid(): void {
        if (localStorage.getItem('userToDo')) {
            this.personInfo = JSON.parse(<string>localStorage.getItem('userToDo'));
            this.loadUser(this.personInfo.uid);
        }
    }


    styleApp(item: string) {
        this.testStyle = item;
        this.countStyle = this.settingService.colorApp(item);
        sessionStorage.setItem('style', JSON.stringify(item));
    }


    loadUser(item: string) {
        this.userService.load(item).subscribe(elem => {
            this.userCount = [elem];
            this.task = Object.values(elem.task);
            this.styleApp(elem.setting.style);
            this.sortTask(elem.setting.sort);
            this.cleanHistory();
        })
    }


    informTask(item: boolean, elem: string): void {
        if (!item) {
            this.userCount[0].finishedTask++;
            if (!this.testTask(elem)) this.userCount[0].unfinishedTask++;
        }
        else this.userCount[0].finishedTask--;
        const starCountRef = 'users/' + this.personInfo.uid;
        const count = {
            finishedTask: this.userCount[0].finishedTask,
            unfinishedTask: this.userCount[0].unfinishedTask++
        };
        this.userService.update(starCountRef, count, false)
    }


    updateTask(id: string): void {
        const obj = this.task.filter(elem => { return elem.id === id });
        const starCountRef = 'users/' + this.personInfo.uid + '/task/' + id;
        setTimeout(() => {
            const count = { complete: !obj[0].complete }
            this.userService.update(starCountRef, count, false)
            this.informTask(obj[0].complete, obj[0].dataFinish);
        }, 200);
    }


    saveEdit(taskID: string) {
        if (this.taskForm.value.text && this.taskForm.value.dataFinish) {
            const starCountRef = 'users/' + this.personInfo.uid + '/task/' + taskID;
            const count = {
                text: this.taskForm.value.text,
                dataFinish: this.taskForm.value.dataFinish,
                complete: false,
            }
            this.userService.update(starCountRef, count, true)
        }
        else this.settingService.showInfo('Task and data can`t be empty!');
    }


    createProduct(uidUser: string): void {
        if (this.taskForm.value.text && this.taskForm.value.dataFinish) {
            this.userService.create(uidUser, this.taskForm.value).subscribe(() => {
                this.settingService.showSuccess('Data saved successfully!');
                this.edit_block = !this.edit_block;
            }, (err: any) => {
                this.settingService.showSuccess(err);
            })
        }
        else this.settingService.showInfo('Task and data can`t be empty!');
    }


    editTask(item: any): void {
        this.taskID = item.id;
        this.taskForm.patchValue({
            text: item.text,
            dataFinish: item.dataFinish
        });
    }


    removeTask(taskID: any, item: boolean): void {
        if (this.task.length == 1) {
            this.userService.remove(taskID, item, this.personInfo.uid, true);
        }
        else {
            this.userService.remove(taskID, item, this.personInfo.uid, false);
        }
        this.edit_block = true;
    }


    testTask(item: string): boolean {
        const finishData = Number(item.split('-').join(''));
        const todayData = Number(this.settingService.getFullDate(0).split('-').join(''));
        if (finishData - todayData > 0) return true;
        else return false;
    }


    sortTask(item: string): void {
        if (item === '302') {
            this.task.sort(function (x, y) {
                if (!x.complete) return Number(x.dataFinish.split('-').join('')) - Number(y.dataFinish.split('-').join(''))
                return 0
            });
        } else this.task.sort((x) => x.complete ? 0 : -1);
        console.log(this.settingService.getFullDate(0));
    }


    cleanHistory() {

        let days: number = 7;
        if (this.userCount[0].setting.history === '201') days = 1;
        else if (this.userCount[0].setting.history === '203') days = 30;

        let date = new Date();
        const date2 = Number(this.settingService.getFullDate(date.getDate() - days).split('-').join(''));

        this.task.forEach(elem => {
            const date1 = Number(elem.dataFinish.split('-').join(''));
            if (elem.complete && date1 <= date2) this.removeTask(elem.id, true);
        });
    }


}