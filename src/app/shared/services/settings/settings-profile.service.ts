import { Injectable } from '@angular/core';
import { deleteUser } from "firebase/auth";
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SettingsProfileService {
    public colorApp$ = new Subject<string>();

    constructor(
        private toastr: ToastrService,
    ) {

    }


    delete(user: any): void {
        deleteUser(user).then(() => {
            console.log('delete')
        }).catch((error) => {
            console.log(error);
        });

    }

    colorApp(item: string): string {
        if (item == 'A103') return 'rgb(36 183 173)'
        else if (item == 'A102') return '#7CFC00'
        else if (item == 'A104') return 'rgb(239, 19, 48)'
        else return 'rgb(239 80 19)'
    }

    getFullDate(item: number): string {
        let date = new Date();

        if (item) date.setDate(item)

        let dd = String(date.getDate());
        if (Number(dd) < 10) dd = '0' + dd;
        let mm = String(date.getMonth() + 1);
        if (Number(mm) < 10) mm = '0' + mm;
        let yy = String(date.getFullYear());
        return yy + '-' + mm + '-' + dd;
    }


    week(): Array<any> {
        let date = new Date();
        let dateToday = date.getDate();
        date.setDate(date.getDate() - date.getDay());
        let week: Array<any> = [];
        for (let i = 0; i < 7; i++) {
            week.push(
                {
                    week: date.toDateString().slice(0, 3).toLocaleUpperCase(),
                    date: date.getDate(),
                    active: dateToday === date.getDate() ? true : false
                }
            );
            date.setDate(date.getDate() + 1);
        }
        return week;
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

}
