using System.Net;
using System.Text;

public class DigestAuthenticationHandler : HttpClientHandler
{
    private readonly string _username;
    private readonly string _password;

    public DigestAuthenticationHandler(string username, string password)
    {
        _username = username;
        _password = password;
    }

    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        // First request - expect 401 with WWW-Authenticate header
        var response = await base.SendAsync(request, cancellationToken);

        if (response.StatusCode == HttpStatusCode.Unauthorized)
        {
            var authenticateHeader = response.Headers.WwwAuthenticate.FirstOrDefault()?.ToString();

            if (!string.IsNullOrEmpty(authenticateHeader) && authenticateHeader.StartsWith("Digest"))
            {
                // Parse digest challenge
                string realm = DigestAuthenticationHelper.ParseAuthenticateHeader(authenticateHeader, "realm");
                string nonce = DigestAuthenticationHelper.ParseAuthenticateHeader(authenticateHeader, "nonce");
                string qop = DigestAuthenticationHelper.ParseAuthenticateHeader(authenticateHeader, "qop");
                string opaque = DigestAuthenticationHelper.ParseAuthenticateHeader(authenticateHeader, "opaque");

                // Generate digest response
                string uri = request.RequestUri.PathAndQuery;
                string method = request.Method.Method;
                string cnonce = DigestAuthenticationHelper.GenerateNonce();
                string nc = "00000001";

                string digestResponse = DigestAuthenticationHelper.GenerateDigestResponse(
                    _username, _password, realm, nonce, uri, method, qop, nc, cnonce);

                // Create new request with digest authorization
                var newRequest = new HttpRequestMessage(request.Method, request.RequestUri);

                // Copy content if present
                if (request.Content != null)
                {
                    newRequest.Content = new StringContent(
                        await request.Content.ReadAsStringAsync(),
                        Encoding.UTF8,
                        request.Content.Headers.ContentType?.MediaType ?? "application/json");
                }

                // Copy headers
                foreach (var header in request.Headers)
                {
                    newRequest.Headers.TryAddWithoutValidation(header.Key, header.Value);
                }

                // Build digest authorization header
                var authHeaderBuilder = new StringBuilder();
                authHeaderBuilder.Append($"Digest username=\"{_username}\"");
                authHeaderBuilder.Append($", realm=\"{realm}\"");
                authHeaderBuilder.Append($", nonce=\"{nonce}\"");
                authHeaderBuilder.Append($", uri=\"{uri}\"");
                authHeaderBuilder.Append($", response=\"{digestResponse}\"");

                if (!string.IsNullOrEmpty(opaque))
                    authHeaderBuilder.Append($", opaque=\"{opaque}\"");

                if (!string.IsNullOrEmpty(qop))
                {
                    authHeaderBuilder.Append($", qop={qop}");
                    authHeaderBuilder.Append($", nc={nc}");
                    authHeaderBuilder.Append($", cnonce=\"{cnonce}\"");
                }

                newRequest.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Digest",
                    authHeaderBuilder.ToString().Substring("Digest ".Length));

                // Send authenticated request
                response = await base.SendAsync(newRequest, cancellationToken);
            }
        }

        return response;
    }
}
