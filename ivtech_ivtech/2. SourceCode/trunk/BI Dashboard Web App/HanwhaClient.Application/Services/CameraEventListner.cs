using HanwhaClient.Model.DbEntities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Application.Services
{
    public class CameraEventsRegister
    {
        public List<DeviceMaster> Masters { get; set; } = [];
        public List<CameraEventListner> cameraEventListners { get; set; } = [];

        public CameraEventsRegister()
        {
            foreach (var item in Masters)
            {
                IPAddress ipAddress;
                bool v = IPAddress.TryParse("item.CameraIp", out ipAddress);
                if (v)
                {
                    CameraEventListner listner = new CameraEventListner(ipAddress, 587);
                    cameraEventListners.Add(listner);
                    _ = listner.StartListeningAsync();
                }
            }
        }
    }
    
    public class CameraEventListner : IDisposable
    {
        private readonly TcpListener _listener;

        public CameraEventListner(IPAddress iPAddress, int port)
        {
            _listener = new TcpListener(iPAddress, port);
        }

        public async Task StartListeningAsync()
        {
            _listener.Start();
            Console.WriteLine($"Start listning camera events");

            while (true)
            {
                var client = await _listener.AcceptTcpClientAsync();
                using var stream = client.GetStream();
                using var reader = new StreamReader(stream);
                string data = await reader.ReadLineAsync();
                Console.WriteLine($"Received Punch: {data}");
            }
        }
        public void Dispose()
        {
            _listener.Stop();
        }
    }
}
