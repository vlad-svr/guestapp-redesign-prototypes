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
        port=4173,
    )
