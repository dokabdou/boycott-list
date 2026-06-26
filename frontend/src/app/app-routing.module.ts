import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SubmitFormComponent } from './components/submit-form/submit-form.component';
import { PostListComponent } from './components/post-list/post-list.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';

const routes: Routes = [
  { path: '', component: PostListComponent },
  { path: 'submit', component: SubmitFormComponent },
  { path: 'admin', component: AdminDashboardComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
