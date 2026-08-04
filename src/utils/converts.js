export const fileToBase64 = async (file) => {
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

export const convertToHTML = (content) => {
  const regex = /##(.*?)##/;
  const match = content.match(regex);

  if (match) {
    const url = match[1];
    const text = content.replace(regex, "").trim();

    return `
      <p>${text}</p>
      <a 
        href="${url}" 
        target="_blank" 
        rel="noopener noreferrer"
        style="cursor: pointer; text-decoration: none;"
      >
        View Details...
      </a>
    `;
  }

  return `<p>${content}</p>`;
};


export const downloadBase64File = (base64, fileName) => {
  // Remove the data URI prefix if the API includes one
  const cleanBase64 = base64.includes(",")
    ? base64.split(",")[1]
    : base64;

  const byteCharacters = atob(cleanBase64);
  const byteNumbers = new Array(byteCharacters.length);

  for (let index = 0; index < byteCharacters.length; index++) {
    byteNumbers[index] = byteCharacters.charCodeAt(index);
  }

  const byteArray = new Uint8Array(byteNumbers);

  const blob = new Blob([byteArray], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName || "RateSheet.xlsx";

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
};