export const fileToBase64 =async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
  
      reader.readAsDataURL(file);
  
      reader.onload = async () => {
       await resolve(reader.result); // Base64 string
      };
  
      reader.onerror = (error) => {
        reject(error);
      };
    });
  };
  