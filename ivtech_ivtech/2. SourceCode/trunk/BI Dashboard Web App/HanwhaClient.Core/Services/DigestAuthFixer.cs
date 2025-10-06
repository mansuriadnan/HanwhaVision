using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Core.Services
{
    public class DigestAuthFixer
    {
        private readonly string _url;
        private readonly string _username;
        private readonly string _password;

        public DigestAuthFixer(string url, string username, string password)
        {
            _url = url;
            _username = username;
            _password = password;
        }

        public async Task<WebResponse> GetResponse()
        {
            // Step 1: Initial request to get the Digest challenge
            var initialRequest = (HttpWebRequest)WebRequest.Create(_url);
            initialRequest.Method = "GET";

            try
            {
                await initialRequest.GetResponseAsync(); // will throw 401
                throw new Exception("Expected 401 response, but got success.");
            }
            catch (WebException ex) when (ex.Response is HttpWebResponse response && response.StatusCode == HttpStatusCode.Unauthorized)
            {
                string authHeader = response.Headers["WWW-Authenticate"];
                string digestHeader = CreateDigestHeader(authHeader);

                // Step 2: New request with Digest authorization
                var authenticatedRequest = (HttpWebRequest)WebRequest.Create(_url);
                authenticatedRequest.Method = "GET";
                authenticatedRequest.Headers.Add("Authorization", digestHeader);

                return await authenticatedRequest.GetResponseAsync();
            }
        }

        private string CreateDigestHeader(string authHeader)
        {
            var uri = new Uri(_url);
            var method = "GET";

            string realm = GetHeaderValue(authHeader, "realm");
            string nonce = GetHeaderValue(authHeader, "nonce");
            string qop = GetHeaderValue(authHeader, "qop");
            string cnonce = new Random().Next(123400, 9999999).ToString("x");
            string nc = "00000001";

            string ha1 = MD5Hash($"{_username}:{realm}:{_password}");
            string ha2 = MD5Hash($"{method}:{uri.PathAndQuery}");
            string response = MD5Hash($"{ha1}:{nonce}:{nc}:{cnonce}:{qop}:{ha2}");

            var digestHeader = new StringBuilder();
            digestHeader.AppendFormat("Digest username=\"{0}\", ", _username);
            digestHeader.AppendFormat("realm=\"{0}\", ", realm);
            digestHeader.AppendFormat("nonce=\"{0}\", ", nonce);
            digestHeader.AppendFormat("uri=\"{0}\", ", uri.PathAndQuery);
            digestHeader.AppendFormat("response=\"{0}\", ", response);
            digestHeader.AppendFormat("qop={0}, ", qop);
            digestHeader.AppendFormat("nc={0}, ", nc);
            digestHeader.AppendFormat("cnonce=\"{0}\"", cnonce);

            return digestHeader.ToString();
        }

        private string GetHeaderValue(string header, string key)
        {
            var idx = header.IndexOf($"{key}=\"", StringComparison.OrdinalIgnoreCase);
            if (idx < 0) return null;
            var start = idx + key.Length + 2;
            var end = header.IndexOf('"', start);
            return header.Substring(start, end - start);
        }

        private string MD5Hash(string input)
        {
            using var md5 = MD5.Create();
            var inputBytes = Encoding.ASCII.GetBytes(input);
            var hashBytes = md5.ComputeHash(inputBytes);
            var sb = new StringBuilder();
            foreach (var b in hashBytes)
                sb.Append(b.ToString("x2"));
            return sb.ToString();
        }
    }
}
