import logging

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils import timezone

logger = logging.getLogger(__name__)


def send_order_notification(order):
    """Email shop owner whenever a new order is placed."""
    recipient = (
        getattr(settings, 'ORDER_NOTIFICATION_EMAIL', '')
        or getattr(settings, 'CONTACT_EMAIL', '')
        or 'scentraryv@gmail.com'
    )

    if not getattr(settings, 'EMAIL_HOST_PASSWORD', ''):
        logger.warning(
            'Order %s email NOT sent — EMAIL_HOST_PASSWORD is empty in .env. '
            'Add a Gmail App Password to receive order emails.',
            order.order_number,
        )
        return False

    booked_at = timezone.localtime(order.created_at)
    context = {
        'order': order,
        'items': order.items.select_related('product').all(),
        'booked_at': booked_at,
        'booked_date': booked_at.strftime('%d %B %Y'),
        'booked_time': booked_at.strftime('%I:%M %p'),
    }

    subject = f'New Scentra Ryv order {order.order_number} — {order.full_name}, {order.city}'
    text_body = render_to_string('store/emails/order_notification.txt', context)
    html_body = render_to_string('store/emails/order_notification.html', context)

    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', None) or recipient
    message = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=from_email,
        to=[recipient],
        reply_to=[order.email] if getattr(order, 'email', None) else None,
    )
    message.attach_alternative(html_body, 'text/html')

    try:
        message.send(fail_silently=False)
        logger.info('Order notification sent to %s for %s', recipient, order.order_number)
        return True
    except Exception:
        logger.exception('Failed to send order notification for %s', order.order_number)
        return False


def send_return_request_notification(form_data, photo=None):
    """Email shop owner when a customer submits a return request."""
    recipient = (
        getattr(settings, 'ORDER_NOTIFICATION_EMAIL', '')
        or getattr(settings, 'CONTACT_EMAIL', '')
        or 'scentraryv@gmail.com'
    )

    if not getattr(settings, 'EMAIL_HOST_PASSWORD', ''):
        logger.warning(
            'Return request email NOT sent — EMAIL_HOST_PASSWORD is empty in .env.'
        )
        return False

    reason_label = dict(form_data['reason_choices']).get(
        form_data['reason'],
        form_data['reason'],
    )
    lines = [
        'New return / exchange request — Scentra Ryv',
        '',
        f"Name: {form_data['full_name']}",
        f"Phone: {form_data['phone']}",
        f"Email: {form_data.get('email') or '—'}",
        f"Order #: {form_data['order_number']}",
        f"Product: {form_data['product_name']}",
        f"Reason: {reason_label}",
        '',
        'Details:',
        form_data['details'],
    ]
    text_body = '\n'.join(lines)
    subject = f"Return request — {form_data['order_number']} — {form_data['full_name']}"

    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', None) or recipient
    reply_to = [form_data['email']] if form_data.get('email') else None
    message = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=from_email,
        to=[recipient],
        reply_to=reply_to,
    )

    if photo:
        message.attach(photo.name, photo.read(), photo.content_type or 'application/octet-stream')

    try:
        message.send(fail_silently=False)
        logger.info('Return request sent to %s for order %s', recipient, form_data['order_number'])
        return True
    except Exception:
        logger.exception('Failed to send return request for %s', form_data['order_number'])
        return False
