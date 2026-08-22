from django.apps import AppConfig


class StoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'store'
    verbose_name = 'Scentra Ryv Store'

    def ready(self):
        from django.contrib import admin
        admin.site.site_header = 'Scentra Ryv Admin'
        admin.site.site_title = 'Scentra Ryv'
        admin.site.index_title = 'Store Management'
