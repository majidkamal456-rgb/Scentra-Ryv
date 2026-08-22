from django.conf import settings
from django.core.mail import send_mail
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Send a test email to verify Gmail SMTP / App Password setup'

    def handle(self, *args, **options):
        recipient = (
            getattr(settings, 'ORDER_NOTIFICATION_EMAIL', '')
            or getattr(settings, 'CONTACT_EMAIL', '')
            or settings.EMAIL_HOST_USER
        )
        password = getattr(settings, 'EMAIL_HOST_PASSWORD', '') or ''

        self.stdout.write(f'EMAIL_BACKEND = {settings.EMAIL_BACKEND}')
        self.stdout.write(f'EMAIL_HOST_USER = {settings.EMAIL_HOST_USER}')
        self.stdout.write(f'ORDER_NOTIFICATION_EMAIL = {recipient}')
        self.stdout.write(
            f'EMAIL_HOST_PASSWORD = {"SET (" + str(len(password)) + " chars)" if password else "EMPTY — emails will NOT send"}'
        )

        if not password:
            self.stderr.write(self.style.ERROR(
                '\nApp Password missing.\n'
                '1) Open https://myaccount.google.com/apppasswords\n'
                '2) Create Mail app password for scentraryv@gmail.com\n'
                '3) Put it in .env as EMAIL_HOST_PASSWORD=xxxx xxxx xxxx xxxx\n'
                '4) Restart runserver, then run: python manage.py test_order_email\n'
            ))
            return

        try:
            send_mail(
                subject='Scentra Ryv — test order email',
                message=(
                    'This is a test. If you received this, order notifications '
                    'will arrive at this Gmail inbox.'
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient],
                fail_silently=False,
            )
            self.stdout.write(self.style.SUCCESS(
                f'Test email sent to {recipient}. Check inbox (and Spam).'
            ))
        except Exception as exc:
            self.stderr.write(self.style.ERROR(f'Failed to send: {exc}'))
