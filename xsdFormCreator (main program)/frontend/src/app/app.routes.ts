import { Routes } from '@angular/router';
import {Login} from './components/login/login';
import { Frontpage } from './components/frontpage/frontpage';
import { Projects } from './components/projects/projects';
import { Registration } from './components/registration/registration';
import { Editxmlform } from './components/editxmlform/editxmlform';
import { Createxmlform } from './components/createxmlform/createxmlform';
import { Submittedxml } from './components/submittedxml/submittedxml';
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
        path: "formeditor/:id",
        component:Editxmlform
    },
    {
        path: "formmaker",
        component:Createxmlform
    },
    {
        path: "filledxml/:id",
        component:Submittedxml
    },
    {
        path: "fillform/:id",
        component:Fillxmlform
    }
];
