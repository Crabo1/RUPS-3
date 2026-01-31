from posting import Auth, Header, RequestModel, Posting

def on_request(request: RequestModel, posting: Posting) -> None:
    # Add a custom header to the request.
    if not posting.get_variable("auth_token"):
        posting.set_variable("auth_token");

    var = posting.get_variable("auth_token")
    request.headers.append(Header(name="Authorization", value=f"Bearer {var}"))

