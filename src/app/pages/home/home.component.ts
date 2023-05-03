import { Component } from '@angular/core';
import { UsersService } from 'src/app/shared/services/users/users.service';
import { child, get, onValue, push, ref, remove, set, update } from 'firebase/database';
import { Database } from '@angular/fire/database';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Task, user } from 'src/app/shared/model/users/users.module';
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
    public task: Array<any> = [];
    public taskID!: string;
    public taskForm!: UntypedFormGroup;
    public testStyle!: string;
    public countStyle!: string;


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
            
            /*   this.informTask(this.personInfo.uid); */
        }
    }

    // i need render user info just once time !!!
    loadUser(item: string) {
        const dbRef = ref(this.db);
        get(child(dbRef, `users/` + item)).then((snapshot) => {
            if (snapshot.exists()) {
                this.userCount.push(snapshot.val());
                this.testStyle = snapshot.val().setting.style;
                this.countStyle = this.settingService.colorApp(snapshot.val().setting.style);
                sessionStorage.setItem('style', JSON.stringify(snapshot.val().setting.style));
                this.loadTask(this.personInfo.uid,snapshot.val().setting.sort);
            } else {
                console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        })
    }

    loadTask(item: string, elem: string) {
        const starCountRef = ref(this.db, 'users/' + item + '/task/');
        onValue(starCountRef, (snapshot) => {
            this.task = Object.values(snapshot.val());
            /* console.log(this.userCount); */
            this.sortTask(elem);
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
            const obj = new Task(newPostKey!, false, dataFinish, this.settingService.getFullDate(), text);
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

    removeTask(taskID: any): void {
        if (this.task.length == 1) {
            set(ref(this.db, 'users/' + this.personInfo.uid + '/task/'), '')
                .then(() => {
                    this.edit_block = true;
                    this.showSuccess('Task successfully deleted!');
                });
        }
        else {
            remove(ref(this.db, 'users/' + this.personInfo.uid + '/task/' + taskID));
            this.edit_block = true;
            this.showSuccess('Task successfully deleted!');
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
        const todayData = Number(this.settingService.getFullDate().split('-').join(''));
        if (finishData - todayData > 0) return true;
        else return false;
    }

    sortTask(item: string): void {
        this.task.sort(function (x) {
            if (x.complete) return 0
            return -1
        });
        if (item === '302') {
            this.task.sort(function (x, y) {
                if (!x.complete) return Number(x.dataFinish.split('-').join('')) - Number(y.dataFinish.split('-').join(''))
                return 0
            });
        }
    }

}