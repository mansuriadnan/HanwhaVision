export const convertImageToBase64 = (
  imagePath: string,
  callback: (base64: string | null) => void
): void => {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", imagePath, true);
  xhr.responseType = "blob";

  xhr.onload = function () {
    const reader = new FileReader();
    reader.onloadend = function () {
      callback(reader.result as string);
    };
    reader.onerror = () => callback(null);
    reader.readAsDataURL(xhr.response);
  };

  xhr.onerror = () => callback(null);
  xhr.send();
};


export const imagePathToBase64 = async (fileOrPath: File | string): Promise<string> => {
  let blob: Blob;

  if (typeof fileOrPath === "string") {
    const res = await fetch(fileOrPath);
    blob = await res.blob();
  } else {
    blob = fileOrPath;
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const convertBase64ToPngBase64 = (base64: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous"; // Helps avoid CORS issues
      img.src = base64;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject("Unable to get canvas context");
          return;
        }

        ctx.drawImage(img, 0, 0);
        const pngBase64 = canvas.toDataURL("image/png"); // Convert to PNG base64
        resolve(pngBase64);
      };

      img.onerror = (err) => reject(err);
    } catch (error) {
      reject(error);
    }
  });
};