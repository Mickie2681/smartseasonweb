from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'fields', views.FieldViewSet, basename='field')

urlpatterns = [
    path('auth/', views.CustomAuthToken.as_view(), name='api_token_auth'),
    path('register/', views.RegisterView.as_view(), name='api_register'),
    path('profile/', views.UserProfileView.as_view(), name='api_profile'),
    path('users/', views.UserListView.as_view(), name='api_user_list'),
    path('updates/', views.FieldUpdateView.as_view(), name='api_field_update'),
    path('updates/history/<int:field_id>/', views.FieldUpdateHistoryView.as_view(), name='api_update_history'),
    path('dashboard/', views.DashboardStatsView.as_view(), name='api_dashboard'),
    path('', include(router.urls)),
]
