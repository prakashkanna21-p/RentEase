from django.urls import path
from .views import (
    CreateOrderView, MyOrdersView, CreateMaintenanceRequestView,
    MyMaintenanceRequestsView, AdminMaintenanceRequestsView,
    UpdateMaintenanceRequestView, AnalyticsView
)

urlpatterns = [
    path('create/', CreateOrderView.as_view(), name='create-order'),
    path('my-orders/', MyOrdersView.as_view(), name='my-orders'),
    path('maintenance/create/', CreateMaintenanceRequestView.as_view(), name='create-maintenance'),
    path('maintenance/my-requests/', MyMaintenanceRequestsView.as_view(), name='my-maintenance'),
    path('admin/maintenance/', AdminMaintenanceRequestsView.as_view(), name='admin-maintenance'),
    path('admin/maintenance/<int:pk>/', UpdateMaintenanceRequestView.as_view(), name='update-maintenance'),
    path('analytics/', AnalyticsView.as_view(), name='analytics'),
]