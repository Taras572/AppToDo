import { Component } from '@angular/core';
import { FormBuilder, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { UsersService } from 'src/app/shared/services/users/users.service';
import { SettingsProfileService } from 'src/app/shared/services/settings/settings-profile.service';

import { child, get, onValue, ref, remove, set, update } from 'firebase/database';
import { Database } from '@angular/fire/database';
import { setting } from 'src/app/shared/model/users/users.module';

@Component({
    selector: 'app-settings-profile',
    templateUrl: './settings-profile.component.html',
    styleUrls: ['./settings-profile.component.scss']
})
export class SettingsProfileComponent {

    public password: any = 'password';
    public show = false;
    public settingForm!: UntypedFormGroup;
    
    public personInfo: any;
    public setting!: setting;

    public testStyle = '';
    public countStyle!: string;//var style 


    constructor(
        private fb: UntypedFormBuilder,
        public db: Database,
        private toastr: ToastrService,
        public router: Router,
        public auth: Auth,
        public servise: UsersService,
        public settingService: SettingsProfileService
    ) { }


    ngOnInit() {
        this.initSetting();
        this.getUid();
        this.settingService.colorApp$.subscribe(elem => this.countStyle = elem);
    }

    getUid(): void {
        if (localStorage.getItem('userToDo')) {
            this.personInfo = JSON.parse(<string>localStorage.getItem('userToDo'));
            this.loadSettings(this.personInfo.uid);
        }
    }

    initSetting(): void {
        this.settingForm = this.fb.group({
            fullName: [null],
            nickName: [null],
            style: [null],
            history: [null],
            sort: [null]
        });
    }


    loadSettings(Uid: string): void {
        const dbRef = ref(this.db);
        get(child(dbRef, `users/${Uid}/setting/`)).then((snapshot) => {
            if (snapshot.exists()) {
                this.setting = snapshot.val();
                const { fullName, nickName, style, history, sort } = this.setting;
                this.testStyle = style;
               
                this.settingForm.patchValue({
                    fullName: fullName,
                    nickName: nickName,
                    sort: sort,
                    history: history,
                    style: style,
                })

            } else console.log("No data available");
        }).catch((error) => {
            console.error(error);
        });
    }


    deleteProfil() {
        const user = this.auth.currentUser;
        this.settingService.delete(user);
        remove(ref(this.db, 'users/' + user?.uid)).catch(err => console.log(err));
        localStorage.removeItem('userToDo');
        this.router.navigate(['/logining']);
        this.showSuccess('Account successfully deleted!');
    }

    saveSetting() {
        if (this.settingForm.value.fullName || this.settingForm.value.nickName) {
            const starCountRef = 'users/' + this.personInfo.uid + '/setting';
            update(ref(this.db, starCountRef), this.settingForm.value).then(() => {
                console.log(this.settingForm.value);
                this.testStyle = this.settingForm.value.style;
                this.showSuccess('Save successfully!');
            });
        }
        else this.showError('Something went wrong!');
    }


    showSuccess(massage: string): void {
        this.toastr.success(massage);
    }
    showError(massage: string): void {
        this.toastr.error(massage);
    }

}
