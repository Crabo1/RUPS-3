from posting import Posting
import httpx
import json

def on_response(response: httpx.Response, posting: Posting) -> None:
    if response.status_code == 200:
        data = json.loads(response.text)

        posting.set_variable("auth_token", data["token"])
        print(posting.get_variable("auth_token"))
