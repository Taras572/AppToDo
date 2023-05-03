import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';



@NgModule({
    declarations: [],
    imports: [
        CommonModule
    ]
})
export class UsersModule {
    constructor() { }
}

export class Users {
    constructor(
        public id: string,
        public fullName: string,
        public email: string,
        public setting: setting,
        public task: task | string,
        public finishedTask: number,
        public unfinishedTask: number,
        public image: any
    ) { }
}

export class Task {
    constructor(
        public id: string,
        public complete: boolean,
        public dataFinish: string,
        public dataStart: string,
        public text: string
    ) { }
}

export class Setting {
    constructor(
        public fullName: string,
        public nickName: string,
        public style: string,
        public history: string,
        public sort: string
    ) { }
}

export interface setting {
    fullName: string,
    nickName: string,
    style: string,
    history: string,
    sort: string
}

export interface user {
    id: string,
    fullName: string,
    nickName: string,
    email: string,
    setting: setting,
    task: any,
    finishedTask: number,
    unfinishedTask: number,
    image: any
}

export interface task {
    id: string,
    complete: boolean,
    dataFinish: string,
    dataStart: string,
    text: string
}
