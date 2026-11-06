import { Routes } from '@angular/router';
import {Login} from './components/login/login';
import { Frontpage } from './components/frontpage/frontpage';
import { Projects } from './components/projects/projects';
import { Registration } from './components/registration/registration';
import { Xmlform } from './components/xmlform/xmlform';
import { Createxmlform } from './components/createxmlform/createxmlform';
import { Submittedprojects } from './components/submittedprojects/submittedprojects';
import { Fillxmlform } from './components/fillxmlform/fillxmlform';

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
        path: "form/:id",
        component:Xmlform
    },
    {
        path: "form",
        component:Createxmlform
    },
    {
        path: "filledxml/:id",
        component:Submittedprojects
    },
    {
        path: "fillform/:id",
        component:Fillxmlform
    }
];
