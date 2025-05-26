<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['name']) || !isset($data['email']) || !isset($data['review']) || !isset($data['rating'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

try {
    $mail = new PHPMailer(true);

    // Server settings
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com'; // Replace with your SMTP host
    $mail->SMTPAuth = true;
    $mail->Username = 'theophelosmadzinga@gmail.com'; // Replace with your email
    $mail->Password = 'Theo@117'; // Replace with your email password or app-specific password
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;

    // Recipients
    $mail->setFrom($data['email'], $data['name']);
    $mail->addAddress('theophelosmadzinga@gmail.com'); // Replace with the email where you want to receive notifications

    // Content
    $mail->isHTML(true);
    $mail->Subject = 'New Review Submitted';
    $mail->Body = "
        <h2>New Review Submission</h2>
        <p><strong>Name:</strong> {$data['name']}</p>
        <p><strong>Email:</strong> {$data['email']}</p>
        <p><strong>Rating:</strong> {$data['rating']} out of 5 stars</p>
        <p><strong>Review:</strong></p>
        <p>{$data['review']}</p>
    ";

    $mail->send();
    echo json_encode(['success' => true, 'message' => 'Email sent successfully']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => "Email could not be sent. Mailer Error: {$mail->ErrorInfo}"]);
}
?>
