import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, getRedirectResult, sendPasswordResetEmail } from "firebase/auth";
import { Auth } from '@angular/fire/auth';
import { Database } from '@angular/fire/database';
import { ref, set, onValue, get, remove, child, push } from "firebase/database";
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Setting, Users } from 'src/app/shared/model/users/users.module';
import { UsersService } from 'src/app/shared/services/users/users.service';
import { SettingsProfileService } from 'src/app/shared/services/settings/settings-profile.service';



@Component({
    selector: 'app-logining',
    templateUrl: './logining.component.html',
    styleUrls: ['./logining.component.scss']
})
export class LoginingComponent {

    public rotate_sing: number = 0;
    public password: any = 'password';
    public show = false;
    public testStyle!: string;
    public colorStyle!: string;

    public countStyle = {
        email_SingIn: false,
        pass_SingIn: false,
        reset_Pass: false,
        pass_Register: false,
        email_Register: false
    };


    public singInForm!: UntypedFormGroup;
    public singUpForm!: UntypedFormGroup;
    public restorationPass!: UntypedFormGroup;

    constructor(
        private fb: UntypedFormBuilder,
        public auth: Auth,
        public db: Database,
        public router: Router,
        private toastr: ToastrService,
        public userService: UsersService,
        public settingService: SettingsProfileService
    ) {

    }

    ngOnInit(): void {
        this.initRestorationPass();
        this.initSingIn();
        this.initSingUp();
        this.LogIn();
        if (sessionStorage.getItem('style')) {
            this.testStyle = JSON.parse(<string>sessionStorage.getItem('style'));
            this.colorStyle = this.settingService.colorApp(this.testStyle);
        }

    }

    LogIn(): void {
        if (localStorage.getItem('userToDo')) {
            let item = JSON.parse(<string>localStorage.getItem('userToDo'));
            if (item.uid) {
                this.showSuccess('Success');
                setTimeout(() => {
                    this.router.navigate(['/home']);
                }, 500);
            }
        }
    }

    initSingIn(): void {
        this.singInForm = this.fb.group({
            email: [null],
            password: [null]
        })
    }

    initSingUp(): void {
        this.singUpForm = this.fb.group({
            email: [null],
            passwordFirst: [null],
            passwordSecond: [null]
        })
    }

    initRestorationPass(): void {
        this.restorationPass = this.fb.group({
            email: [null]
        })
    }

    createUser() {
        const { email, passwordFirst, passwordSecond } = this.singUpForm.value;
        let pass;
        if (passwordFirst === passwordSecond) pass = passwordFirst;
        
        createUserWithEmailAndPassword(this.auth, email, pass)
            .then((userCredential) => {
                const user = userCredential.user;
                this.setLocalStorage(user);
                this.addUserObj(user);
            })
            .catch((error) => {
                const errorCode = error.code;
                this.checkMassege(errorCode);
            });
    }

    defoultInputStyle() {
        this.countStyle = {
            email_SingIn: false,
            pass_SingIn: false,
            reset_Pass: false,
            pass_Register: false,
            email_Register: false
        };
        this.initRestorationPass();
        this.initSingIn();
        this.initSingUp();
    }

    singIn() {
        const { email, password } = this.singInForm.value;
        signInWithEmailAndPassword(this.auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                this.setLocalStorage(user);
                this.showSuccess('Success');
                setTimeout(() => {
                    this.router.navigate(['/home']);
                }, 500);
            })
            .catch((error) => {
                const errorCode = error.code;
                this.checkMassege(errorCode);

            });
    }

    singInGoogle(): void {
        const provider = new GoogleAuthProvider();
        signInWithPopup(this.auth, provider)
            .then((result) => {
                const credential = GoogleAuthProvider.credentialFromResult(result);
                const user = result.user;
                this.checkUser(user);
                console.log(user);
            }).catch((error) => {
                const errorCode = error.code;
                this.checkMassege(errorCode);
            });
    }

    setLocalStorage(user: object) {
        localStorage.setItem('userToDo', JSON.stringify(user));
    }

    checkUser(user: any) {
        const dbRef = ref(this.db);
        get(child(dbRef, `users/${user.uid}`)).then((snapshot) => {
            if (snapshot.exists()) {
                this.setLocalStorage(user);
                this.showSuccess('Success');
                setTimeout(() => {
                    this.router.navigate(['/home']);
                }, 500);
            } else {
                this.setLocalStorage(user);
                this.addUserObj(user);
            }
        }).catch((error) => {
            console.error(error);
        });

    }

    resetPassword(): void {
        const { email } = this.restorationPass.value;
        sendPasswordResetEmail(this.auth, email)
            .then(() => {

            })
            .catch((error) => {
                const errorCode = error.code;
                this.checkMassege(errorCode);
            });
    }

    addUserObj(user: any): void {
        const setting = new Setting(user.displayName || 'Guest', '', 'A101', '202', '301');
        const obj = new Users(user.uid, user.displayName || 'Guest', user.email, setting, '', 0, 0, user.photoURL || "../../../assets/image/Avatar_Cat-512.webp");
        set(ref(this.db, 'users/' + user.uid), obj)
            .then(() => {
                this.showSuccess('Success');
                setTimeout(() => {
                    this.router.navigate(['/home']);
                }, 500);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    checkMassege(errorCode: string): void {
        let letter = errorCode[5].toLocaleUpperCase();
        let mess = letter.concat(errorCode.slice(6).split('-').join(' '));

        if (errorCode == 'auth/email-already-in-use') {
            this.countStyle.email_Register = true;
            this.showError(mess);
        }
        else if (errorCode == 'auth/invalid-email') {
            this.countStyle.email_Register = true;
            this.countStyle.email_SingIn = true;
            this.showError(mess);
        }
        else if (errorCode == 'auth/missing-email') {
            this.countStyle.email_Register = true;
            this.countStyle.email_SingIn = true;
            this.countStyle.reset_Pass = true;
            this.showError(mess);
        }

        if (errorCode == 'auth/weak-password') {
            this.countStyle.pass_Register = true;
            this.showError(mess);
        }
        else if (errorCode == 'auth/internal-error') {
            this.countStyle.pass_Register = true;
            this.countStyle.pass_SingIn = true;
            this.showError(mess);
        }

        if (errorCode == 'auth/wrong-password') {
            this.countStyle.pass_SingIn = true;
            this.showError(mess);
        }

        if (errorCode == 'auth/user-not-found') {
            this.countStyle.email_SingIn = true;
            this.showError(mess);
        }

        if (errorCode == 'auth/admin-restricted-operation') {
            this.countStyle.email_Register = true;
            this.countStyle.pass_Register = true;
            this.showError('Write email and password');
        }
        if (errorCode == 'auth/popup-closed-by-user') {
            this.showError(mess);
        }

    }

    showPass() {
        if (this.password === 'password') {
            this.password = 'text';
            this.show = true;
        } else {
            this.password = 'password';
            this.show = false;
        }
    }

    showSuccess(massage: string): void {
        this.toastr.success(massage, '', { timeOut: 500, });
    }

    showError(massage: string): void {
        this.toastr.error(massage);
    }

}
