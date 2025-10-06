using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;

public class DigestAuthenticationHelper
{
    public static string GenerateDigestResponse(string username, string password, string realm,
        string nonce, string uri, string method, string qop = null, string nc = null, string cnonce = null)
    {
        string ha1 = CalculateMD5Hash($"{username}:{realm}:{password}");
        string ha2 = CalculateMD5Hash($"{method}:{uri}");

        string response;
        if (string.IsNullOrEmpty(qop))
        {
            response = CalculateMD5Hash($"{ha1}:{nonce}:{ha2}");
        }
        else
        {
            response = CalculateMD5Hash($"{ha1}:{nonce}:{nc}:{cnonce}:{qop}:{ha2}");
        }

        return response;
    }

    public static string ParseAuthenticateHeader(string authenticateHeader, string key)
    {
        var regex = new Regex($@"{key}=""?([^"",\s]+)""?");
        var match = regex.Match(authenticateHeader);
        return match.Success ? match.Groups[1].Value : string.Empty;
    }

    private static string CalculateMD5Hash(string input)
    {
        using (var md5 = MD5.Create())
        {
            byte[] inputBytes = Encoding.UTF8.GetBytes(input);
            byte[] hashBytes = md5.ComputeHash(inputBytes);
            return Convert.ToHexString(hashBytes).ToLower();
        }
    }

    public static string GenerateNonce()
    {
        return Guid.NewGuid().ToString("N");
    }
}
