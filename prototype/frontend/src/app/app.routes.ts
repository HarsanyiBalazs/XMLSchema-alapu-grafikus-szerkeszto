import { Routes } from '@angular/router';
import {Login} from './components/login/login';
import { Frontpage } from './components/frontpage/frontpage';
import { Projects } from './components/projects/projects';
import { Registration } from './components/registration/registration';
import { Xmlvalidator } from './components/xmlvalidator/xmlvalidator';
import { Xmlform } from './components/xmlform/xmlform';
import { Createxmlform } from './components/createxmlform/createxmlform';

export const routes: Routes = [
    {
        path: "login",
        component:Login 
    },
    {
        path: "",
        component:Frontpage
    },
    {
        path: "projects",
        component:Projects
    },
    {
        path: "register",
        component:Registration 
    },
    {
        path: "validator",
        component:Xmlvalidator
    },
    {
        path: "form/:id",
        component:Xmlform
    },
    {
        path: "form",
        component:Createxmlform
    }
];
