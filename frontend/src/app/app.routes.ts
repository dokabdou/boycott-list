import { Routes } from '@angular/router';
import { PostListComponent } from './components/post-list/post-list.component';
import { SubmitFormComponent } from './components/submit-form/submit-form.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { PostDetailComponent } from './components/post-detail/post-detail.component';
import { LoginComponent } from './components/login/login.component';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: PostListComponent },
  { path: 'posts', component: PostListComponent },
  { path: 'login', component: LoginComponent },
  { path: 'submit', component: SubmitFormComponent },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [adminGuard] },

  // Dynamic route – do not prerender
  {
    path: 'post/:id',
    component: PostDetailComponent,
    data: { renderMode: 'client' }   // ✅ skip SSR for this route
  }
];
