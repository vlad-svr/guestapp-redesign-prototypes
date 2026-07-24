"""Static server for the guestapp prototype, with caching turned off.

`python3 -m http.server` sends no Cache-Control header at all, so browsers fall
back to heuristic caching and hold on to .css/.js files across reloads — even a
hard reload. That has silently served stale files here more than once: an edit
lands on disk, the page keeps rendering the old rule, and the mismatch looks
like a CSS specificity bug rather than a cache.

`no-store` costs nothing on localhost and makes an edit-and-reload always show
the edit. Same handler the dashboard prototype uses.
"""
import functools
import http.server
import os

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

if __name__ == '__main__':
    directory = os.path.dirname(os.path.abspath(__file__))
    http.server.test(
        HandlerClass=functools.partial(NoCacheHandler, directory=directory),
        port=4174,
    )
