import logging
from celery import shared_task
from django.contrib.auth import get_user_model
from django.utils.module_loading import import_string

User = get_user_model()
logger = logging.getLogger("django") 


@shared_task(bind=True, max_retries=3, default_retry_delay=300)
def send_djoser_email_task(self, email_class_path, user_id, context_update):
    try:
        user = User.objects.get(pk=user_id)
        email_class = import_string(email_class_path)

        context = {"user": user}
        context.update(context_update)

        to = [user.email]
        email_class(context=context).send(to, now=True)
    except Exception as e:
        logger.error(f"[Email] {e}")
        raise self.retry(exc=e)