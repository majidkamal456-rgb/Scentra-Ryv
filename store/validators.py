import re

from django.core.exceptions import ValidationError
from django.template.defaultfilters import filesizeformat


ALLOWED_PAYMENT_EXTENSIONS = {'jpg', 'jpeg', 'png', 'pdf'}
MAX_PAYMENT_FILE_SIZE = 5 * 1024 * 1024  # 5MB

ALLOWED_REVIEW_IMAGE_EXTENSIONS = {'jpg', 'jpeg', 'png', 'webp'}
ALLOWED_REVIEW_VIDEO_EXTENSIONS = {'mp4', 'webm', 'mov'}
MAX_REVIEW_IMAGE_SIZE = 5 * 1024 * 1024  # 5MB
MAX_REVIEW_VIDEO_SIZE = 25 * 1024 * 1024  # 25MB


def validate_phone(value):
    cleaned = re.sub(r'\D', '', value or '')
    if cleaned.startswith('92') and len(cleaned) == 12:
        cleaned = '0' + cleaned[2:]
    if not re.match(r'^03[0-9]{9}$', cleaned):
        raise ValidationError(
            'Enter a valid 11-digit Pakistani mobile number (e.g. 03001234567).'
        )


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


def validate_review_image(file):
    if file.size > MAX_REVIEW_IMAGE_SIZE:
        raise ValidationError(
            f'Image must be under 5MB. Your file is {filesizeformat(file.size)}.'
        )
    ext = file.name.rsplit('.', 1)[-1].lower()
    if ext not in ALLOWED_REVIEW_IMAGE_EXTENSIONS:
        raise ValidationError('Only JPG, PNG, and WEBP images are allowed.')
    content_type = getattr(file, 'content_type', '')
    allowed = {'image/jpeg', 'image/png', 'image/webp'}
    if content_type and content_type not in allowed:
        raise ValidationError('Invalid image type.')


def validate_review_video(file):
    if file.size > MAX_REVIEW_VIDEO_SIZE:
        raise ValidationError(
            f'Video must be under 25MB. Your file is {filesizeformat(file.size)}.'
        )
    ext = file.name.rsplit('.', 1)[-1].lower()
    if ext not in ALLOWED_REVIEW_VIDEO_EXTENSIONS:
        raise ValidationError('Only MP4, WEBM, and MOV videos are allowed.')
    content_type = getattr(file, 'content_type', '')
    allowed = {'video/mp4', 'video/webm', 'video/quicktime'}
    if content_type and content_type not in allowed:
        raise ValidationError('Invalid video type.')
