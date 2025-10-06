import { useState, useEffect } from 'react';



// Simple HTTP Interceptor Hook
export function useRequestCounter() {
  const [pendingCount, setPendingCount] = useState(0);
  const [isAllComplete, setIsAllComplete] = useState(true);

  useEffect(() => {
    let requestCount = 0;

    // Store original fetch
    const originalFetch = window.fetch;

    // Intercept fetch
    window.fetch = (...args) => {
      requestCount++;
      setPendingCount(prev => prev + 1);
      setIsAllComplete(false);

      return originalFetch(...args)
        .then(response => {
          requestCount--;
          setPendingCount(requestCount);
          if (requestCount === 0) setIsAllComplete(true);
          return response;
        })
        .catch(error => {
          requestCount--;
          setPendingCount(requestCount);
          if (requestCount === 0) setIsAllComplete(true);
          throw error;
        });
    };

    // Cleanup on unmount
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return { pendingCount, isAllComplete };
}

// // Simple Demo Component
// export default function SimpleRequestCounter() {
//   const { pendingCount, isAllComplete } = useRequestCounter();
  
//   const makeRequest = () => {
//     fetch('https://jsonplaceholder.typicode.com/users');
//   };

//   const makeMultipleRequests = () => {
//     fetch('https://jsonplaceholder.typicode.com/users');
//     fetch('https://jsonplaceholder.typicode.com/posts');
//     fetch('https://jsonplaceholder.typicode.com/todos');
//   };

//   return (
//     <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg">
//       <h1 className="text-2xl font-bold mb-4">Request Counter</h1>
      
//       <div className="mb-4">
//         <p className="text-lg">Pending Requests: <span className="font-bold">{pendingCount}</span></p>
//         <p className="text-lg">All Complete: 
//           <span className={`font-bold ml-2 ${isAllComplete ? 'text-green-600' : 'text-red-600'}`}>
//             {isAllComplete ? 'Yes' : 'No'}
//           </span>
//         </p>
//       </div>

//       <div className="space-y-2">
//         <button 
//           onClick={makeRequest}
//           className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//         >
//           Make 1 Request
//         </button>
        
//         <button 
//           onClick={makeMultipleRequests}
//           className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
//         >
//           Make 3 Requests
//         </button>
//       </div>

//       {/* Show when all requests are done */}
//       {isAllComplete && pendingCount === 0 && (
//         <div className="mt-4 p-2 bg-green-100 text-green-800 rounded">
//           ✅ All requests finished!
//         </div>
//       )}
//     </div>
//   );
// }