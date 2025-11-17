using System.Net.Http;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Net.Http.Headers;

public class DigestHandler : HttpClientHandler
{
    private readonly string _username;
    private readonly string _password;
    private readonly HttpClient _client;

    public DigestHandler(string username, string password)
    {
        _username = username;
        _password = password;
        _client = new HttpClient(new HttpClientHandler { AllowAutoRedirect = false });
    }

    public async Task<HttpResponseMessage> SendAsync(string url, CancellationToken cancellationToken)
    {
        var firstResponse = await _client.GetAsync(url, cancellationToken);

        if (firstResponse.StatusCode != HttpStatusCode.Unauthorized ||
            !firstResponse.Headers.WwwAuthenticate.ToString().Contains("Digest"))
        {
            return firstResponse; // Already authorized or different scheme
        }

        var authHeader = firstResponse.Headers.WwwAuthenticate.ToString();
        var uri = new Uri(url);
        var method = "GET";

        var digestHeader = CreateDigestHeader(authHeader, uri.PathAndQuery, method);

        var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Authorization = new AuthenticationHeaderValue("Digest", digestHeader);

        return await _client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
    }

    private string CreateDigestHeader(string authHeader, string uri, string method)
    {
        string realm = GetValue(authHeader, "realm");
        string nonce = GetValue(authHeader, "nonce");
        string qop = GetValue(authHeader, "qop");
        string opaque = GetValue(authHeader, "opaque");

        string nc = "00000001";
        string cnonce = Guid.NewGuid().ToString("N").Substring(0, 16);

        string ha1 = MD5Hash($"{_username}:{realm}:{_password}");
        string ha2 = MD5Hash($"{method}:{uri}");
        string response = MD5Hash($"{ha1}:{nonce}:{nc}:{cnonce}:{qop}:{ha2}");

        var header = new StringBuilder();
        header.AppendFormat("username=\"{0}\", ", _username);
        header.AppendFormat("realm=\"{0}\", ", realm);
        header.AppendFormat("nonce=\"{0}\", ", nonce);
        header.AppendFormat("uri=\"{0}\", ", uri);
        header.Append("algorithm=MD5, ");
        header.AppendFormat("response=\"{0}\", ", response);
        if (!string.IsNullOrEmpty(opaque))
            header.AppendFormat("opaque=\"{0}\", ", opaque);
        header.AppendFormat("qop={0}, ", qop);
        header.AppendFormat("nc={0}, ", nc);
        header.AppendFormat("cnonce=\"{0}\"", cnonce);

        return header.ToString();
    }

    private static string GetValue(string header, string key)
    {
        var index = header.IndexOf($"{key}=\"", StringComparison.OrdinalIgnoreCase);
        if (index < 0) return null;
        index += key.Length + 2;
        var end = header.IndexOf("\"", index);
        return header.Substring(index, end - index);
    }

    private static string MD5Hash(string input)
    {
        using var md5 = MD5.Create();
        var bytes = Encoding.ASCII.GetBytes(input);
        var hash = md5.ComputeHash(bytes);
        return BitConverter.ToString(hash).Replace("-", "").ToLowerInvariant();
    }
}
