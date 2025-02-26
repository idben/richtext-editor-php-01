const observerMap = new WeakMap();

editor.addEventListener("click", (event) => {
  const target = event.target;

  if (target.tagName === "IMG") {
    attachResizeHandles(target);
    event.stopPropagation();
  } else {
    removeResizeHandles();
  }
});

function attachResizeHandles(img) {
  removeResizeHandles();

  if (!img.dataset.id) {
    img.dataset.id = `img-${Date.now()}`;
  }

  const toolbar = document.createElement("div");
  toolbar.classList.add("toolbar");
  toolbar.setAttribute("contenteditable", "false");
  toolbar.innerHTML = `
    <button data-action="float-left" data-id="${img.dataset.id}">左浮動</button>
    <button data-action="float-right" data-id="${img.dataset.id}">右浮動</button>
    <button data-action="align-center" data-id="${img.dataset.id}">置中</button>
    <button data-action="reset" data-id="${img.dataset.id}">重置</button>
  `;
  document.body.appendChild(toolbar);

  toolbar.addEventListener("click", (event) => {
    event.stopPropagation();

    const action = event.target.dataset.action;
    const imgId = event.target.dataset.id;
    if (!imgId) return;

    const img = document.querySelector(`[data-id="${imgId}"]`);
    if (!img) return;

    switch (action) {
      case "float-left":
        setFloat(img, "inline-start");
        break;
      case "float-right":
        setFloat(img, "inline-end");
        break;
      case "align-center":
        setAlign(img, "center");
        break;
      case "reset":
        resetFloatAlign(img);
        break;
    }

    updateHandlesPosition(img);
  });

  ["top-left", "top-right", "bottom-left", "bottom-right"].forEach((pos) => {
    const handle = document.createElement("div");
    handle.classList.add("resize-handle", pos);
    document.body.appendChild(handle);
    handle.addEventListener("mousedown", (event) =>
      startResize(event, img, pos)
    );
  });

  updateHandlesPosition(img);

  if (observerMap.has(img)) {
    observerMap.get(img).disconnect();
  }
  const observer = new MutationObserver(() => updateHandlesPosition(img));
  observer.observe(img, { attributes: true, attributeFilter: ["style"] });

  observerMap.set(img, observer);
}

function removeResizeHandles() {
  document
    .querySelectorAll(".toolbar, .resize-handle")
    .forEach((el) => el.remove());

  document.querySelectorAll("img").forEach((img) => {
    if (observerMap.has(img)) {
      observerMap.get(img).disconnect();
      observerMap.delete(img);
    }
  });
}

function startResize(event, img, position) {
  event.preventDefault();

  const startX = event.clientX;
  const startY = event.clientY;
  const startWidth = img.width;
  const startHeight = img.height;
  const aspectRatio = img.width / img.height;

  function onMouseMove(e) {
    let newWidth = startWidth;
    let newHeight = startHeight;

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    if (position.includes("right")) {
      newWidth = startWidth + deltaX;
      newHeight = newWidth / aspectRatio;
    } else if (position.includes("left")) {
      newWidth = startWidth - deltaX;
      newHeight = newWidth / aspectRatio;
    }

    if (position.includes("bottom")) {
      newHeight = startHeight + deltaY;
      newWidth = newHeight * aspectRatio;
    } else if (position.includes("top")) {
      newHeight = startHeight - deltaY;
      newWidth = newHeight * aspectRatio;
    }

    if (newWidth > 20 && newHeight > 20) {
      img.style.width = `${newWidth}px`;
      img.style.height = `${newHeight}px`;
      updateHandlesPosition(img);
    }
  }

  function onMouseUp() {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
}

function setFloat(img, direction) {
  img.style.float = direction;
  updateHandlesPosition(img);
}

function setAlign(img, align) {
  if (align === "center") {
    img.style.display = "block";
    img.style.margin = "0 auto";
    img.style.float = "none";
  }
  updateHandlesPosition(img);
}

function resetFloatAlign(img) {
  img.style.float = "";
  img.style.margin = "";
  img.style.display = "";
  updateHandlesPosition(img);
}

function updateHandlesPosition(img) {
  const toolbar = document.querySelector(".toolbar");
  if (toolbar) {
    toolbar.style.top = `${img.offsetTop + 10}px`;
    toolbar.style.left = `${img.offsetLeft + 10}px`;
  }

  const handles = document.querySelectorAll(".resize-handle");
  handles.forEach((handle) => {
    switch (handle.classList[1]) {
      case "top-left":
        handle.style.top = `${img.offsetTop - 5}px`;
        handle.style.left = `${img.offsetLeft - 5}px`;
        break;
      case "top-right":
        handle.style.top = `${img.offsetTop - 5}px`;
        handle.style.left = `${img.offsetLeft + img.width - 5}px`;
        break;
      case "bottom-left":
        handle.style.top = `${img.offsetTop + img.height - 5}px`;
        handle.style.left = `${img.offsetLeft - 5}px`;
        break;
      case "bottom-right":
        handle.style.top = `${img.offsetTop + img.height - 5}px`;
        handle.style.left = `${img.offsetLeft + img.width - 5}px`;
        break;
    }
  });
}
