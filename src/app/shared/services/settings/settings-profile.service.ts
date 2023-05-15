import { Injectable } from '@angular/core';
import { deleteUser } from "firebase/auth";
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SettingsProfileService {
    public colorApp$ = new Subject<string>();

    constructor() {

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

    getFullDate(item:number): string {
        let date = new Date();

        if(item)date.setDate(item)

        let dd = String(date.getDate());
        if (Number(dd) < 10) dd = '0' + dd;
        let mm = String(date.getMonth() + 1);
        if (Number(mm) < 10) mm = '0' + mm;
        let yy = String(date.getFullYear());
        return yy + '-' + mm + '-' + dd;
    }

}
