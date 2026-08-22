import re

from django.core.exceptions import ValidationError
from django.template.defaultfilters import filesizeformat


ALLOWED_PAYMENT_EXTENSIONS = {'jpg', 'jpeg', 'png', 'pdf'}
MAX_PAYMENT_FILE_SIZE = 5 * 1024 * 1024  # 5MB


def validate_phone(value):
    cleaned = re.sub(r'[\s\-\(\)]', '', value)
    if not re.match(r'^(\+92|0)?3[0-9]{9}$', cleaned):
        raise ValidationError('Enter a valid Pakistani mobile number (e.g. 03001234567).')


def validate_payment_screenshot(file):
    if file.size > MAX_PAYMENT_FILE_SIZE:
        raise ValidationError(
            f'File size must be under 5MB. Your file is {filesizeformat(file.size)}.'
        )

    ext = file.name.rsplit('.', 1)[-1].lower()
    if ext not in ALLOWED_PAYMENT_EXTENSIONS:
        raise ValidationError('Only JPG, PNG, and PDF files are allowed.')

    content_type = getattr(file, 'content_type', '')
    allowed_types = {
        'image/jpeg',
        'image/png',
        'application/pdf',
    }
    if content_type and content_type not in allowed_types:
        raise ValidationError('Invalid file type. Upload JPG, PNG, or PDF only.')
