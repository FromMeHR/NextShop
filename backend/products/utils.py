def get_sitemap_params(request):
    try:
        start = max(int(request.query_params.get("start", 0)), 0)
        end = int(request.query_params.get("end", 50000))
        if start >= end:
            return None, None
        return start, end
    except (ValueError, TypeError):
        return None, None