<?php
header('Content-Type: application/json');

$uploadDir = './uploads/';

if (!is_dir($uploadDir)) {
  mkdir($uploadDir, 0777, true);
}

if ($_FILES['file']['error'] === UPLOAD_ERR_OK) {
  $file = $_FILES['file'];
  $fileInfo = pathinfo($file['name']);
  $extension = isset($fileInfo['extension']) ? '.' . $fileInfo['extension'] : '';
  $filename = time() . $extension;
  $targetFile = $uploadDir . $filename;

  if (file_exists($targetFile)) {
    $filename = uniqid() . '_' . $filename;
    $targetFile = $uploadDir . $filename;
  }

  if (move_uploaded_file($file['tmp_name'], $targetFile)) {
    echo json_encode([
      'success' => true,
      'filename' => $filename
    ]);
  } else {
    echo json_encode([
      'success' => false,
      'message' => '移動檔案失敗'
    ]);
  }
} else {
  echo json_encode([
    'success' => false,
    'message' => '上傳發生錯誤'
  ]);
}
