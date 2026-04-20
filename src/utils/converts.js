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
