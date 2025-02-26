const editor = document.querySelector("#editor");
const htmlView = document.querySelector("#htmlView");
const headingSelect = document.querySelector("#headingSelect");
const fontSizeSelect = document.querySelector("#fontSizeSelect");
const toggleViewBtn = document.querySelector("#toggleView");
const colorSelect = document.querySelector("#colorSelect");
let isHtmlView = false;

let styleSheet = document.createElement("style");
document.head.appendChild(styleSheet);
for (let i = 10; i <= 60; i += 2) {
  styleSheet.sheet.insertRule(`.fs-${i} { font-size: ${i}px; }`, styleSheet.sheet.cssRules.length);
  
  let option = document.createElement("option");
  option.value = `fs-${i}`;
  option.textContent = `${i}px`;
  fontSizeSelect.appendChild(option);
}

function getParentTag(range) {
  let node = range.commonAncestorContainer;
  if (node.nodeType === 3) node = node.parentNode;
  if (["H1", "H2", "H3", "H4", "H5"].includes(node.tagName)) {
    return node;
  }
  return null;
}

function getEnclosingSpan(range) {
  let node = range.commonAncestorContainer;
  while (node && node !== editor) {
    if (node.tagName === "SPAN" && node.className.match(/fs-\d+/)) {
      return node;
    }
    node = node.parentNode;
  }
  return null;
}

function isPartiallyInsideSpan(range) {
  let startNode = range.startContainer;
  let endNode = range.endContainer;

  if (startNode.nodeType === 3) startNode = startNode.parentNode;
  if (endNode.nodeType === 3) endNode = endNode.parentNode;

  return (startNode.closest("span") || endNode.closest("span"));
}

headingSelect.addEventListener("change", function () {
  let tag = this.value;
  if (!tag) return;

  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  const range = selection.getRangeAt(0);
  const selectedText = range.toString().trim();
  if (selectedText === "") return;

  let parentTag = getParentTag(range);

  if (parentTag && parentTag.tagName.toLowerCase() === tag) {
    let textNode = document.createTextNode(parentTag.textContent);
    parentTag.replaceWith(textNode);
    this.value = "";
    return;
  }

  if (parentTag) {
    alert("不能對部分標籤文字增加新標籤，請選取完整標籤範圍");
    this.value = "";
    return;
  }

  const newElement = document.createElement(tag);
  newElement.textContent = selectedText;
  range.deleteContents();
  range.insertNode(newElement);
  this.value = "";
});

fontSizeSelect.addEventListener("change", function () {
  let sizeClass = this.value;
  if (!sizeClass) return;

  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  const range = selection.getRangeAt(0);
  const selectedText = range.toString().trim();
  if (selectedText === "") return;

  let parentTag = getParentTag(range);
  let enclosingSpan = getEnclosingSpan(range);

  if (enclosingSpan && enclosingSpan.classList.contains(sizeClass)) {
    let textNode = document.createTextNode(enclosingSpan.textContent);
    enclosingSpan.replaceWith(textNode);
    this.value = "";
    return;
  }

  if (isPartiallyInsideSpan(range)) {
    alert("無法對部分已有字級的文字再設定新字級");
    this.value = "";
    return;
  }

  const span = document.createElement("span");
  span.classList.add(sizeClass);
  span.textContent = selectedText;

  range.deleteContents();
  range.insertNode(span);
  this.value = "";
});

colorSelect.addEventListener("input", function () {
  let color = this.value;
  if (!color) return;

  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  const range = selection.getRangeAt(0);
  const selectedText = range.toString().trim();
  if (selectedText === "") return;

  let enclosingSpan = getEnclosingSpan(range);

  if (enclosingSpan && enclosingSpan.style.color === color) {
    enclosingSpan.style.color = "";
    if (!enclosingSpan.getAttribute("style")) enclosingSpan.replaceWith(...enclosingSpan.childNodes);
    return;
  }

  if (isPartiallyInsideSpan(range)) {
    alert("無法對部分已有顏色的文字再設定新顏色");
    return;
  }

  const span = document.createElement("span");
  span.style.color = color;
  span.textContent = selectedText;

  range.deleteContents();
  range.insertNode(span);
});

toggleViewBtn.addEventListener("click", function () {
  removeResizeHandles();
  isHtmlView = !isHtmlView;
  if (isHtmlView) {
    htmlView.textContent = editor.innerHTML;
    editor.style.display = "none";
    htmlView.style.display = "block";
  } else {
    editor.innerHTML = htmlView.textContent;
    editor.style.display = "block";
    htmlView.style.display = "none";
  }
});