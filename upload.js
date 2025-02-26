const btnUpload = document.querySelector("#btnUpload");
const fileInput = document.querySelector("#fileInput");

btnUpload.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", async () => {
  const file = fileInput.files[0];
  if (file) {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("./upload.php", {
        method: "POST",
        body: formData
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        const img = document.createElement('img');
        img.src = `./uploads/${result.filename}`;
        img.style.width = "100%";
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          range.insertNode(img);
        }else{
          editor.append(img);
        }
      } else {
        console.error("Upload error: ", result.message);
      }
    } catch (err) {
      console.error("Upload error: ", err);
    }
  }
});