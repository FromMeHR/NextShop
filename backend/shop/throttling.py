import logging
from django.core.cache import cache
from rest_framework.throttling import BaseThrottle

logger = logging.getLogger("django") 


class RedisFixedWindowThrottle(BaseThrottle):
    """
    Works properly on Linux not WSL 2 using Docker
    """
    calls = None
    period = None
    scope = None

    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            ident = f"user:{request.user.pk}"
        else:
            ident = f"ip:{self.get_ident(request)}"
        logger.info(f"[Throttle] scope={self.scope}, ident={ident}")
        return f"throttle:{self.scope}:{ident}"

    def allow_request(self, request, view):
        if not self.calls or not self.period:
            return True

        key = self.get_cache_key(request, view)

        current = cache.get(key)
        if current is None:
            cache.set(key, 1, timeout=self.period)
            current = 1
        else:
            current = cache.incr(key)

        if current > self.calls:
            ttl = cache.ttl(key)
            self._wait = ttl if ttl and ttl > 0 else self.period
            return False
        return True

    def wait(self):
        return getattr(self, "_wait", self.period)


class UserRegisterThrottle(RedisFixedWindowThrottle):
    calls = 5
    period = 600
    scope = "user_register"


class UserResendActivationThrottle(RedisFixedWindowThrottle):
    calls = 5
    period = 600
    scope = "resend_activation"


class UserResetPasswordThrottle(RedisFixedWindowThrottle):
    calls = 5
    period = 600
    scope = "reset_password"


class TokenObtainThrottle(RedisFixedWindowThrottle):
    calls = 10
    period = 600
    scope = "token_obtain"


class TokenRefreshThrottle(RedisFixedWindowThrottle):
    calls = 30
    period = 600
    scope = "token_refresh"


class CreateOrderThrottle(RedisFixedWindowThrottle):
    calls = 5
    period = 600
    scope = "create_order"