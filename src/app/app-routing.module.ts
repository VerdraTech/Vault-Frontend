import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/landing-page/landing-page.page').then(
        (m) => m.LandingPage
      ),
  },
  {
    path: 'folder/:id',
    loadChildren: () =>
      import('./folder/folder.module').then((m) => m.FolderPageModule),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'inventory',
    loadComponent: () =>
      import('./pages/inventory/inventory.page').then((m) => m.InventoryPage),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile.page').then((m) => m.ProfilePage),
  },
  {
    path: 'marketplace',
    loadComponent: () =>
      import('./pages/marketplace/marketplace.page').then(
        (m) => m.MarketplacePage
      ),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      scrollPositionRestoration: 'disabled',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
