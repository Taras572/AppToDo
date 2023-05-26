import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { onValue, ref, child, push, remove, set, update } from 'firebase/database';
import { Database } from '@angular/fire/database';
import { SettingsProfileService } from '../settings/settings-profile.service';
import { Task, user } from 'src/app/shared/model/users/users.module';


@Injectable({
    providedIn: 'root'
})
export class UsersService {
    public edit$ = new Subject<boolean>();
    public test$ = new Subject<boolean>();

    constructor(
        public db: Database,
        public settingService: SettingsProfileService
    ) { }

    guard(){
        const UID = JSON.parse(<string>localStorage.getItem('userToDo'));
        if(UID && UID.apiKey){
            return true;
        }
        else{
            return false;
        }
    }


    load(item: string): Observable<any> {
        const observable = new Observable((subscriber) => {
            const starCountRef = ref(this.db, 'users/' + item);
            onValue(starCountRef, (snapshot) => {
                subscriber.next(snapshot.val());
            })
        })
        return observable;
    }


    update(url: string, obj: any, item: boolean) {
        update(ref(this.db, url), obj).then(() => {
            if (item) {
                this.settingService.showSuccess('Data saved successfully!');
                this.edit$.next(true);
            }
        })
    }


    remove(taskID: any, item: boolean, uid: string, rem: boolean) {
        if (rem) {
            set(ref(this.db, 'users/' + uid + '/task/'), '')
                .then(() => {
                    this.settingService.showSuccess(item ? 'History has been cleaned' : 'Task successfully deleted!');
                });
        }
        else {
            remove(ref(this.db, 'users/' + uid + '/task/' + taskID));
            this.settingService.showSuccess(item ? 'History has been cleaned' : 'Task successfully deleted!');
        }
    }


    create(item: string, elem: any) {
        const newPostKey = push(child(ref(this.db), 'users')).key?.substring(1);
        const { text, dataFinish } = elem;
        const obj = new Task(newPostKey!, false, dataFinish, this.settingService.getFullDate(0), text);

        const observable = new Observable((subscriber) => {
            subscriber.next(
                set(ref(this.db, 'users/' + item + '/task/' + newPostKey), obj)
                    .then(() => {
                    })
                    .catch((error) => {
                    })
            )
        })
        return observable;
    }
}
