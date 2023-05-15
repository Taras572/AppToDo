import { Component } from '@angular/core';
import { UsersService } from 'src/app/shared/services/users/users.service';
import { child, get, onValue, push, ref, remove, set, update } from 'firebase/database';
import { Database } from '@angular/fire/database';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Task, user } from 'src/app/shared/model/users/users.module';
import { SettingsProfileService } from 'src/app/shared/services/settings/settings-profile.service';
import { sendPasswordResetEmail } from 'firebase/auth';


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
    public task: Array<any> = [];
    public taskID!: string;
    public taskForm!: UntypedFormGroup;
    public testStyle!: string;
    public countStyle!: string;

    public days: Array<any> = [];


    constructor(
        public userService: UsersService,
        public db: Database,
        private toastr: ToastrService,
        private fb: UntypedFormBuilder,
        public settingService: SettingsProfileService
    ) {

    }

    ngOnInit(): void {
        this.initTasks();
        this.getUid();
        this.settingService.colorApp$.subscribe(elem => this.countStyle = elem);
        this.week();
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

    // i need render user info just once time !!!
    loadUser(item: string) {
        const dbRef = ref(this.db);
        get(child(dbRef, `users/` + item)).then((snapshot) => {
            if (snapshot.exists()) {
                this.userCount.push(snapshot.val());
                this.styleApp(snapshot.val().setting.style);
                this.loadTask(this.personInfo.uid, snapshot.val().setting.sort);
            } else {
                console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        })
    }


    styleApp(item: string) {
        this.testStyle = item;
        this.countStyle = this.settingService.colorApp(item);
        sessionStorage.setItem('style', JSON.stringify(item));
    }


    loadTask(item: string, elem: string) {
        const starCountRef = ref(this.db, 'users/' + item + '/task/');
        onValue(starCountRef, (snapshot) => {
            this.task = Object.values(snapshot.val());
            this.sortTask(elem);
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
        update(ref(this.db, starCountRef), {
            finishedTask: this.userCount[0].finishedTask,
            unfinishedTask: this.userCount[0].unfinishedTask++
        });
    }


    createProduct(uidUser: string): void {
        if (this.taskForm.value.text && this.taskForm.value.dataFinish) {
            const newPostKey = push(child(ref(this.db), 'users')).key?.substring(1);
            const { text, dataFinish } = this.taskForm.value;
            const obj = new Task(newPostKey!, false, dataFinish, this.settingService.getFullDate(0), text);
            set(ref(this.db, 'users/' + uidUser + '/task/' + newPostKey), obj)
                .then(() => {
                    this.showSuccess('Data saved successfully!');
                    this.edit_block = !this.edit_block;
                })
                .catch((error) => {
                    console.log(error);
                    this.showSuccess(error);
                });
        }
        else this.showInfo('Task and data can`t be empty!');
    }


    updateTask(id: string): void {
        const obj = this.task.filter(elem => { return elem.id === id });
        const starCountRef = 'users/' + this.personInfo.uid + '/task/' + id;
        setTimeout(() => {
            update(ref(this.db, starCountRef), {
                complete: !obj[0].complete
            });
            this.informTask(obj[0].complete, obj[0].dataFinish);
        }, 200);
    }


    editTask(item: any): void {
        this.taskID = item.id;
        this.taskForm.patchValue({
            text: item.text,
            dataFinish: item.dataFinish
        });
    }

    saveEdit(taskID: string) {
        if (this.taskForm.value.text && this.taskForm.value.dataFinish) {
            const starCountRef = 'users/' + this.personInfo.uid + '/task/' + taskID;
            update(ref(this.db, starCountRef), {
                text: this.taskForm.value.text,
                dataFinish: this.taskForm.value.dataFinish,
                complete: false,
            }).then(() => {
                this.showSuccess('Data saved successfully!');
                this.edit_block = true;
            });
        }
        else this.showInfo('Task and data can`t be empty!');
    }


    removeTask(taskID: any, item: boolean): void {
        if (this.task.length == 1) {
            set(ref(this.db, 'users/' + this.personInfo.uid + '/task/'), '')
                .then(() => {
                    this.edit_block = true;
                    this.showSuccess(item ? 'History has been cleared' : 'Task successfully deleted!');
                });
        }
        else {
            remove(ref(this.db, 'users/' + this.personInfo.uid + '/task/' + taskID));
            this.edit_block = true;
            this.showSuccess(item ? 'History has been cleared' : 'Task successfully deleted!');
        }
    }


    showSuccess(massage: string): void {
        this.toastr.success(massage);
    }
    showError(massage: string): void {
        this.toastr.error(massage);
    }
    showInfo(massage: string): void {
        this.toastr.info(massage);
    }


    testTask(item: string): boolean {
        const finishData = Number(item.split('-').join(''));
        const todayData = Number(this.settingService.getFullDate(0).split('-').join(''));
        if (finishData - todayData > 0) return true;
        else return false;
    }


    sortTask(item: string): void {
        this.task.sort((x) => x.complete ? 0 : -1);
        if (item === '302') {
            this.task.sort(function (x, y) {
                if (!x.complete) return Number(x.dataFinish.split('-').join('')) - Number(y.dataFinish.split('-').join(''))
                return 0
            });
        }
    }


    week(): void {
        let date = new Date();
        let dateToday = date.getDate();
        date.setDate(date.getDate() - date.getDay());
        this.days = [];
        for (let i = 0; i < 7; i++) {
            this.days.push(
                {
                    week: date.toDateString().slice(0, 3).toLocaleUpperCase(),
                    date: date.getDate(),
                    active: dateToday === date.getDate() ? true : false
                }
            );
            date.setDate(date.getDate() + 1);
        }
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